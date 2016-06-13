import React, { PropTypes } from 'react';
import Q from 'q';
import _ from 'lodash';

function xhrSuccess(req) {
    return (req.status === 200 || (req.status === 0 && req.responseText));
}

export default {
    propTypes: {
      file: PropTypes.instanceOf(File).isRequired,
      onUploadComplete: PropTypes.func.isRequired,
      onUploadFail: PropTypes.func.isRequired
    },

    uploadFile(file, url) {
      const promise = this.uploadFilePromise(file, url);

      const done = () => {
          this.setState({
              done: true
          });

          this.props.onUploadComplete(file);
      };

      const fail = () => {
          this.setState({
              failed: true
          });

          this.props.onUploadFail(file);
      };

      const progress = progress => {
          this.setState({
              percentage: progress
          });
      };

      promise.then(done, fail, progress);

      return promise;
    },

    uploadFilePromise(file, url) {
      const fd = new FormData();
      const request = new XMLHttpRequest();

      const defer = Q.defer();

      function onload() {
        if (xhrSuccess(request)) {
          defer.resolve(request.responseText);
        } else {
          defer.reject(new Error(`Status code was ${request.status}`));
        }
      }

      function onerror() {
        defer.reject(new Error("Can't XHR " + JSON.stringify(url)));
      }

      function onprogress(event) {
        defer.notify(event.loaded / event.total);
      }

      try {
        request.open('POST', url, true);
        request.onreadystatechange = () => {
          if (request.readyState === 4) {
            onload();
          }
        };
        request.onload = request.load = onload;
        request.onerror = request.error = onerror;
        request.upload.onprogress = request.upload.progress = onprogress;

        fd.append('file', file);

        request.send(fd);
      } catch (exception) {
        defer.reject(exception.message, exception);
      }

      return defer.promise;
    }
};
