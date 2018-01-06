import { shallow } from 'enzyme'
import React from 'react'

import * as mod from '../src/search'

describe('search', function () {
  describe("RoutedMediaSearch component", function () {
    it('should handle querystring media queries', function () {
      const dispatch = makeDispatch(action => {
        assert.deepEqual(action.type, "mediaSearch")
        assert.deepEqual(action.payload, "something")
      })
      const dom = shallow(<mod.RoutedMediaSearch
        dispatch={dispatch}
        basePath="/test"
        location={{pathname: "/test", search: "?q=something&foo=bar"}}
      />)
      assert.equal(dom.state().query, "something", "initial query")
      dispatch.check()
    })
  })
})

function makeDispatch(check) {
  const actions = []
  const dispatch = action => {
    actions.push(action)
  }
  dispatch.check = (n=1) => {
    assert.equal(actions.length, n, "actions: " + JSON.stringify(actions))
    check(...actions)
  }
  return dispatch
}