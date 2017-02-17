import { List as IList, Map, fromJS } from 'immutable'
import _ from 'lodash'
import React from 'react'
import { List } from 'semantic-ui-react'

import { effect, combine } from './effects'
import makeReducer from './store'
import { formatTime } from './util'
//import './playlist.scss'

const IX = "playlist index"

export const defaultState = Map({
  items: IList(),
  timestamp: null,
  numTracks: null,
  currentIndex: null,
  currentTrack: Map(),
})

export const reducer = makeReducer({
  gotPlayer: (state=defaultState, action, status) => {
    const index = parseInt(status.playlist_cur_index)
    const list = status.playlist_loop
    const data = {
      playerid: status.playerid,
      timestamp: status.playlist_timestamp,
      numTracks: status.playlist_tracks,
      currentIndex: index,
    }
    const changed = isPlaylistChanged(state.toObject(), data)
    const effects = []
    const gotCurrent = index >= list[0][IX] && index <= list[list.length - 1][IX]
    if (status.isPlaylistUpdate || changed) {
      data.items = fromJS(status.playlist_loop)
      if (gotCurrent) {
        data.currentTrack = fromJS(list[index - list[0][IX]])
      }
    } else {
      data.currentTrack = fromJS(list[0] || {})
    }
    if (changed && (!status.isPlaylistUpdate || !gotCurrent)) {
      effects.push(effect(require("./player").loadPlayer, data.playerid, true))
    }
    return combine(state.merge(data), effects)
  },
}, defaultState)

export function advanceToNextTrack(state) {
  const items = state.get("items")
  const index = state.get("currentIndex")
  const nextIndex = index === null ? null : (index + 1)
  const nextTrack = items.find(item => item.get(IX) === nextIndex) || Map()
  return state.merge({
    currentTrack: nextTrack,
    currentIndex: nextIndex,
  })
}

function isPlaylistChanged(prev, next) {
  const playlistSig = obj => Map({
    playerid: obj.playerid,
    timestamp: obj.timestamp,
    numTracks: obj.numTracks,
  })
  return !playlistSig(prev).equals(playlistSig(next))
}

export const Playlist = props => (
  <List className="playlist" selection>
    {_.map(props.items, item => {
      const index = item["playlist index"]
      return <PlaylistItem
        {...item}
        command={props.command}
        index={index}
        active={props.currentIndex === index}
        key={index} />
    })}
  </List>
)

function songTitle({artist, title}) {
  if (artist && title) {
    return artist + " - " + title
  }
  return artist || title
}

export const PlaylistItem = props => (
  <List.Item
      onDoubleClick={() => props.command("playlist", "index", props.index)}
      active={props.active}>
    <List.Content>
      <List.Description>
        <div className="duration" style={{float: "right"}}>
          {formatTime(props.duration || 0)}
        </div>
        {songTitle(props)}
      </List.Description>
    </List.Content>
  </List.Item>
)
