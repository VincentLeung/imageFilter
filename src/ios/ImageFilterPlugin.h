#import <Cordova/CDV.h>

@interface ImageFilterPlugin : CDVPlugin {
  // Member variables go here.
}

@property (nonatomic, retain) CIContext* ctx;

- (void)applyFilter:(CDVInvokedUrlCommand*)command;
@end
