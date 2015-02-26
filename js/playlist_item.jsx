var React = require('./vendor/react/react-with-addons.js');

var cx = React.addons.classSet;

function formatTime(seconds) {
    function zeroPad(n) {
        return n < 10 ? '0' + n : n;
    }
    return Math.floor(seconds / 60) + ':' + zeroPad(seconds % 60);
}

var PlaylistItem = React.createClass({
    render: function() {

        var item = this.props.item;

        var details;

        if (item.title) {
            details = [];

            if (item.artist) {
                details.push(
                    <span className="artist">{item.artist}</span>
                );

                if (item.album) {
                    details.push(<span>,&nbsp;</span>);
                    details.push(
                        <span className="album">{item.album}</span>
                    );
                }

                if (item.date) {
                    details.push(<span>,&nbsp;</span>);
                    details.push(
                        <span className="year">{item.date}</span>
                    );
                }
            }

            details =
                <div>
                    <p className="title">{item.title}</p>
                    <p className="details">
                        {details}
                    </p>
                </div>;
        } else {
            details = <span className="url">{item.file}</span>
        }

        var time = formatTime(+this.props.item.time);

        var classes = cx({
            'playlist-item': true,
            'playlist-item-selected': this.props.selected,
            'playlist-item-playing': this.props.playing
        });

        return (
            <li className={classes} onMouseDown={this.itemClick} onDoubleClick={this.itemDblClick}>
                <span className="time">{time}</span>
                <div className="image" />
                {details}
            </li>
        );
    },

    itemClick: function(e) {
        if (this.props.onItemClick) {
            this.props.onItemClick(e, this.props.item);
        }
    },

    itemDblClick: function(e) {
        if (this.props.onItemDblClick) {
            this.props.onItemDblClick(e, this.props.item);
        }

        e.preventDefault();
    }
});

module.exports = PlaylistItem;