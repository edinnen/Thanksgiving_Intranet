
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Link } from 'react-router'

import PlaylistGrid from '../../components/PlaylistGrid'
import Header from '../../components/Header'
import Parallax from '../../components/Parallax'
import Thumbnail from '../../components/Thumbnail'

import * as helpers from '../../helpers'
import * as uiActions from '../../services/ui/actions'
import * as mopidyActions from '../../services/mopidy/actions'
import * as spotifyActions from '../../services/spotify/actions'

class DiscoverFeatured extends React.Component{

	constructor(props) {
		super(props);
	}

	componentDidMount(){
		this.props.spotifyActions.getFeaturedPlaylists();
	}

	playPlaylist(e,playlist){
        this.props.mopidyActions.playPlaylist(playlist.uri)
	}

	handleContextMenu(e,item){
		e.preventDefault()
		var data = { 
			e: e,
			context: 'playlist',
			uris: [item.uri],
			items: [item]
		}
		this.props.uiActions.showContextMenu(data)
	}

	renderIntro(playlist = null){
		if (playlist){
			return (
				<div className="intro">
					<Parallax image={helpers.sizedImages(playlist.images).huge} blur />
					<div className="content cf">
						<Link 
							to={global.baseURL+'playlist/'+playlist.uri}
							onContextMenu={e => this.handleContextMenu(e,playlist)}>
								<Thumbnail images={playlist.images} />
						</Link>
						<Link to={global.baseURL+'playlist/'+playlist.uri}>
							<h1>{playlist.name}</h1>
						</Link>
						{playlist.description ? <h3 dangerouslySetInnerHTML={{__html: playlist.description}}></h3> : null}
						<div className="actions">
							<button className="primary" onClick={e => this.playPlaylist(e,playlist)}>Play</button>
						</div>
					</div>
				</div>
			)
		} else {
			return (
				<div className="intro">
					<Parallax />
				</div>
			)
		}
	}

	render(){
		if (helpers.isLoading(this.props.load_queue,['spotify_browse/featured-playlists'])){
			return (
				<div className="view discover-featured-view">
					<Header icon="star" title="Featured playlists" />
					<div className="body-loader">
						<div className="loader"></div>
					</div>
				</div>
			)
		}

		var playlists = []
		if (this.props.featured_playlists){
			for (var i = 0; i < this.props.featured_playlists.playlists.length; i++){
				var uri = this.props.featured_playlists.playlists[i]
				if (this.props.playlists.hasOwnProperty(uri)){
					playlists.push(this.props.playlists[uri])
				}
			}
		}

		// Pull the first playlist out and we'll use this as a banner
		var first_playlist = playlists.splice(0,1)
		if (first_playlist){
			first_playlist = first_playlist[0]
		}

		return (
			<div className="view discover-featured-view">
				<Header className="overlay" icon="star" title="Featured playlists" />
				{this.renderIntro(first_playlist)}
				<section className="grid-wrapper">
					{playlists ? <PlaylistGrid playlists={playlists} /> : null }
				</section>
			</div>
		);
	}
}


/**
 * Export our component
 *
 * We also integrate our global store, using connect()
 **/

const mapStateToProps = (state, ownProps) => {
	return {
		load_queue: state.ui.load_queue,
		featured_playlists: state.spotify.featured_playlists,
		playlists: state.ui.playlists
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		uiActions: bindActionCreators(uiActions, dispatch),
		mopidyActions: bindActionCreators(mopidyActions, dispatch),
		spotifyActions: bindActionCreators(spotifyActions, dispatch)
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DiscoverFeatured)