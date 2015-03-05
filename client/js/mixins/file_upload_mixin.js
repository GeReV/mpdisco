var React = require('react/addons');
var Q = require('q');
var _ = require('underscore');

function xhrSuccess(req) {
    return (req.status === 200 || (req.status === 0 && req.responseText));
}

var FileUploadMixin = {
    propTypes: {
        file: React.PropTypes.instanceOf(File).isRequired,
        onUploadComplete: React.PropTypes.func.isRequired,
        onUploadFail: React.PropTypes.func.isRequired
    },

    uploadFile: function(file, url) {
        var promise = this.uploadFilePromise(file, url);

        var done = function() {
            this.setState({
                done: true
            });

            this.props.onUploadComplete(file);
        }.bind(this);

        var fail = function() {
            this.setState({
                failed: true
            });

            this.props.onUploadFail(file);
        }.bind(this);

        var progress = function(progress) {
            this.setState({
                percentage: progress
            });
        }.bind(this);

        promise.then(done, fail, progress);

        return promise;
    },

    uploadFilePromise: function(file, url) {
        var fd = new FormData();
        var request = new XMLHttpRequest();

        var defer = Q.defer();

        function onload() {
            if (xhrSuccess(request)) {
                defer.resolve(request.responseText);
            } else {
                defer.reject(new Error("Status code was " + request.status));
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
            request.onreadystatechange = function () {
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

module.exports = FileUploadMixin;