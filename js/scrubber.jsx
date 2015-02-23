var React = require('./vendor/react/react-with-addons.js');

var Scrubber = React.createClass({
    getInitialState: function() {
        return {

        };
    },

    componentWillMount: function() {

    },

    render: function() {
        return (
            <div id="scrubber">
                <div className="progress"></div>
            </div>
        );
    }
});

module.exports = Scrubber;