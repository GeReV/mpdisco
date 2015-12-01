import React, { PropTypes } from 'react';

export default React.createClass({
    propTypes: {
        percentage: PropTypes.number.isRequired
    },

    render: function() {
        var style = {
            width: (this.props.percentage * 100) + '%'
        };

        return (
            <span className={this.props.className || 'progress-bar'}>
                <span className="progress" style={style} />
            </span>
        );
    }
});
