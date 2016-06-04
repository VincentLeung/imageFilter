#import <Cordova/CDV.h>

@interface ImageFilterPlugin : CDVPlugin {
  // Member variables go here.
}

- (void)applyFilter:(CDVInvokedUrlCommand*)command;
@end
