mpdisco
=======

A team-controlled music server based on mpd.

Accessing the MPDisco server puts each user, after logging in, in a rotating DJ queue.
Each user will be given one hour (by default) to control the playlist and music player. 

Installation
------------

First off, MPDisco depends on the installation of [MPD](http://www.musicpd.org/) on the server.
Follow the [installation instructions](http://mpd.wikia.com/wiki/Install) to install.

Using NPM, run:

```npm install mpdisco```

Modify `config.json` to change the music directory, play time for each DJ and session secret (recommended).

Running
-------

To run MPDisco, in the installation directory, use:

```node index.js```