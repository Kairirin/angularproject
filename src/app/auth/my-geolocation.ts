export class MyGeolocation {
    static getLocation(): Promise<GeolocationCoordinates> {
        return new Promise<GeolocationCoordinates>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                pos => {
                    resolve(pos.coords);
                },
                error => {
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            reject("User denied the request for Geolocation.");
                            break;
                        case error.POSITION_UNAVAILABLE:
                            reject("Location information is unavailable.");
                            break;
                        case error.TIMEOUT:
                            reject("The request to get user location timed out.");
                            break;
                        default:
                            reject("An unknown error occurred.");
                            break;
                    }
                }
            );
        });
    }
}
