import React from 'react';

export default React.createClass({
    render: function() {
        return
            <div id="error">
                {this.props.message}
            </div>;
    }
});
