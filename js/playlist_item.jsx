var React = require('./vendor/react/react-with-addons.js');

var PlaylistItem = React.createClass({
    render: function() {

        var item = this.props.item;

        var details;

        if (item.title) {
            var artist = item.artist ? <span className="artist">{item.artist}</span> : '';
            var album = item.album  ? <span className="album">{item.album}</span> : '';
            var date = item.date ? (', ' + <span className="year">{item.date}</span>) : '';

            details =
                <div>
                    <p className="title">{item.title}</p>
                    <p className="details">
                    {artist}
                    {album}
                    {date}
                    </p>
                </div>;
        } else {
            details = <span className="url">{item.file}</span>
        }

        return (
            <li className="playlist-item" data-songid={item.id}>
                {this.props.time}
                <div className="image"></div>
                {details}
            </li>
        );
    }
});

module.exports = PlaylistItem;