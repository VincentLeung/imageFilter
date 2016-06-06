#import "ImageFilterPlugin.h"
#import <Cordova/CDV.h>

@implementation ImageFilterPlugin

- (NSURL*)getTargetUrl
{
    NSURL *documentsDir = [[[NSFileManager defaultManager] URLsForDirectory:NSDocumentDirectory inDomains:NSUserDomainMask] firstObject];
    NSString *filename = [NSString stringWithFormat:@"%f-%d", [NSDate timeIntervalSinceReferenceDate], arc4random_uniform(64)];
    NSURL *fileURL = [documentsDir URLByAppendingPathComponent:filename];
    return fileURL;
}

- (NSData*)getImageData:(CIImage*)image context:(CIContext*)context
{
    CGRect extent = [image extent];
    CGImageRef cgImage = [context createCGImage:image fromRect:extent];
    UIImage* finalImage = [UIImage imageWithCGImage:cgImage];
    CGImageRelease(cgImage);
    return UIImagePNGRepresentation(finalImage);
}

- (BOOL)saveImage:(CIImage*)image context:(CIContext*)context fileURL:(NSURL*)fileURL
{
    NSData* imageData = [self getImageData:image context:context];
    
    return [imageData writeToURL:fileURL atomically:YES];
}

- (NSString*)getImageDataInBase64:(CIImage*)image context:(CIContext*)context
{
    NSData* imageData = [self getImageData:image context:context];
    
    return [imageData base64EncodedStringWithOptions:NSDataBase64EncodingEndLineWithLineFeed];
}

- (CIImage*)getRawCIImage:(NSString*)path
{
    UIImage* rawImage = [UIImage imageWithData:[NSData dataWithContentsOfURL:[NSURL URLWithString:path]]];
    CIImage* image = [CIImage imageWithCGImage:rawImage.CGImage];
    return image;
}

- (CIImage*)applyFilter_CISepiaTone:(CIImage*)image intensity:(NSNumber*)intensity
{
    if ([intensity doubleValue] > 1 || [intensity doubleValue] <= 0) {
        intensity = @0.8f;
    }
    CIFilter *filter = [CIFilter filterWithName:@"CISepiaTone"];
    [filter setValue:image forKey:kCIInputImageKey];
    [filter setValue:intensity forKey:kCIInputIntensityKey];
    CIImage *result = [filter valueForKey:kCIOutputImageKey];
    return result;
}

- (CIImage*)applyFilter_Pixellate:(CIImage*)image scale:(NSNumber*)scale
{
    CIFilter *filter = [CIFilter filterWithName:@"CIPixellate"];
    [filter setValue:image forKey:kCIInputImageKey];
    [filter setValue:scale forKey:kCIInputScaleKey];
    CIImage *result = [filter valueForKey:kCIOutputImageKey];
    return result;
}

- (CIImage*)getFaceMaskImage:(CIImage*)image context:(CIContext*)context
{
    NSDictionary *opts = @{ CIDetectorAccuracy : CIDetectorAccuracyHigh };
    CIDetector *detector = [CIDetector detectorOfType:CIDetectorTypeFace
                                              context:context
                                              options:opts];
    
    NSArray *faceArray = [detector featuresInImage:image options:nil];
    CIImage *maskImage = nil;
    
    for (CIFeature *f in faceArray) {
        CGFloat centerX = f.bounds.origin.x + f.bounds.size.width / 2.0;
        CGFloat centerY = f.bounds.origin.y + f.bounds.size.height / 2.0;
        CGFloat radius = MIN(f.bounds.size.width, f.bounds.size.height) / 1.5;
        NSDictionary *radialGadientParams = @{@"inputRadius0": @(radius),
                                              @"inputRadius1": @(radius + 1.0f),
                                              @"inputColor0": [CIColor colorWithRed:0.0 green:1.0 blue:0.0 alpha:1.0],
                                              @"inputColor1": [CIColor colorWithRed:0.0 green:0.0 blue:0.0 alpha:0.0],
                                              kCIInputCenterKey: [CIVector vectorWithX:centerX Y:centerY]};
        CIFilter *radialGradient = [CIFilter filterWithName:@"CIRadialGradient" withInputParameters:radialGadientParams];
        CIImage *circleImage = [radialGradient valueForKey:kCIOutputImageKey];
        if (maskImage == nil) {
            maskImage = circleImage;
        } else {
            NSDictionary *sourceOverCompositingParams = @{kCIInputImageKey: circleImage,
                                                          kCIInputBackgroundImageKey: maskImage};
            maskImage = [[CIFilter filterWithName:@"CISourceOverCompositing" withInputParameters:sourceOverCompositingParams] valueForKey:kCIOutputImageKey];
        }
    }
    return maskImage;
}

- (CIImage*)applyFilter_AnonymousFaces:(CIImage*)image context:(CIContext*)context
{
    float scale = MAX([image extent].size.width, [image extent].size.height) * 0.025;
    CIImage* maskImage = [self getFaceMaskImage:image context:context];
    if (maskImage != nil) {
        CIImage* pixellateImage = [self applyFilter_Pixellate:image scale:@(scale)];
        CIImage* result = [[CIFilter filterWithName:@"CIBlendWithMask"
                                withInputParameters:@{
                                                      kCIInputImageKey: pixellateImage,
                                                      kCIInputBackgroundImageKey: image,
                                                      kCIInputMaskImageKey: maskImage
                                                      }] valueForKey:kCIOutputImageKey];
        return result;
    }
    return image;
}

- (BOOL)getBoolInDict:(NSDictionary*)dict forKey:(NSString*)key defaultVal:(BOOL)defaultVal
{
    id val = [dict valueForKey:key];
    return (val) ? [val boolValue] : defaultVal;
}

- (NSNumber*)getNumberInDict:(NSDictionary*)dict forKey:(NSString*)key defaultVal:(NSNumber*)defaultVal
{
    NSNumber* number = nil;
    id val = [dict valueForKey:key];
    if (val != nil) {
        if ([val isKindOfClass:[NSString class]]) {
            NSNumberFormatter *f = [[NSNumberFormatter alloc] init];
            f.numberStyle = NSNumberFormatterDecimalStyle;
            number = [f numberFromString:val];
        } else {
            if ([val isKindOfClass:[NSNumber class]]) {
                number = val;
            }
        }
    }    
    if (number == nil) {
        return defaultVal;
    }
    return number;
}

- (NSString*)applyFilterAt:(NSString*)src filter:(NSDictionary*)filter
{
    CIContext *context = [CIContext contextWithOptions:nil];
    CIImage* image = [self getRawCIImage:src];
    
    NSString* filterName = [filter valueForKey:@"name"];
    if ([filterName compare:@"AnonymousFaces"] == NSOrderedSame) {
        image = [self applyFilter_AnonymousFaces:image context:context];
    }
    if ([filterName compare:@"SepiaTone"] == NSOrderedSame) {
        NSNumber* intensity = [self getNumberInDict:filter forKey:@"intensity" defaultVal:@0];
        image = [self applyFilter_CISepiaTone:image intensity:intensity];
    }
    
    if ([self getBoolInDict:filter forKey:@"saveToDisk" defaultVal:NO]){
        NSURL *targetFileURL = [self getTargetUrl];
        if ([self saveImage:image context:context fileURL:targetFileURL]) {
            return [targetFileURL absoluteString];
        }
    }
    return [self getImageDataInBase64:image context:context];
}

- (void)applyFilter:(CDVInvokedUrlCommand*)command
{
    NSDictionary* params = [command argumentAtIndex:0];
    NSString* srcUrl = [params valueForKey:@"srcUrl"];
    NSDictionary* filter = [params valueForKey:@"filter"];
    
    if (srcUrl == nil || [srcUrl length] <= 0 || filter == nil || [filter count] <= 0) {
        CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR];
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    } else {
        [self.commandDelegate runInBackground:^{
            NSString* resultUrlStr = [self applyFilterAt:srcUrl filter:filter];
            CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:resultUrlStr];
            [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
        }];
    }
}

@end
