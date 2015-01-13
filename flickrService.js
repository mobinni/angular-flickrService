angular.module('<appName>')
  .service('flickrService', ['$http', '$q', function flickr($http, $q) {
    return {
      getPhotoSet: function (token, photoset_id) {
        var api_photostream = "https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos";
        var api_photo = "https://api.flickr.com/services/rest/?method=flickr.photos.getInfo";
        // Create x2js instance with default config
        var x2js = new X2JS();
        var deferred = $q.defer();
        $http.get(api_photostream + '&api_key=' + token + '&photoset_id=' + photoset_id)
          .success(function (result) {
            var jsonObj = x2js.xml_str2json(result);
            var photos = jsonObj.rsp.photoset.photo;
            var photoObjects = [];
            var promises = [];
            for (var i = 0; i < photos.length; i++) {
              photoObjects.push(photos[i]);
              promises.push($http.get(api_photo + '&api_key=' + token + '&photo_id=' + photos[i]._id));
            }
            var photoUrls = [];
            $q.all(promises).then(function (results) {
              for (var i = 0; i < photos.length; i++) {
                var jsonResult = x2js.xml_str2json(results[i].data);
                photoUrls.push(
                  "https://farm"
                  + jsonResult.rsp.photo._farm
                  + ".staticflickr.com/"
                  + jsonResult.rsp.photo._server + "/"
                  + jsonResult.rsp.photo._id
                  + "_"
                  + jsonResult.rsp.photo._secret
                  + ".jpg"
                );
              }
              deferred.resolve(photoUrls);
            });
          })
          .error(function (error) {
            deferred.reject(error);
          });
        return deferred.promise;
      }
    }
  }]);
