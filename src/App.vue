<template>
  <div class="app">
    <h1>Most linked API</h1>
    <p>Type a query to see results from this API.</p>
    <cdx-text-input v-model="query"
      @input="updateCards"
      placeholder="Filter"></cdx-text-input>
    <cdx-card v-if="selected" :thumbnail="selected.thumbnail"
        :class="cardClass"
        :url="selected.url"
        :force-thumbnail="true">
        <template #title>
            {{ selected.title }}
        </template>
        <template #description>
            <div v-html="selected.extract_html"></div>
        </template>
    </cdx-card>
    <div v-if="pages.length">
      <h2>algorithm 1</h2>
      <page-list :pages="pages"></page-list>
      <h2>algorithm 2</h2>
      <page-list :pages="pages2"></page-list>
      </div>
  </div>
</template>

<script>
import api from './api.js';
import PageList from './PageList.vue';
import {
  CdxCard,
  CdxTextInput
} from '@wikimedia/codex';
import { defineComponent, ref } from 'vue';
let pages = ref([]);
let pages2 = ref([]);
const query = ref( '' );

const mwApiToCodexData = ( data ) => {
  const thumb = data.thumbnail;
  return Object.assign( {}, data, {
    url: data.content_urls.desktop.page,
    thumbnail: thumb ? {
      width: thumb.width,
      height: thumb.height,
      url: thumb.source
    } : undefined
  } );
};
const loadSummary = ( title ) => {
  return fetch(`https://en.m.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`)
    .then((r) => {
      return r.ok ? r.json() : null;
    })
    .then((r) => {
      if ( !r ) {
        return null;
      }
      const data = mwApiToCodexData( r );
      return data;
    });
}


const getMostLinked = ( pages ) => {
  return api.mostLinks( pages ).then((pages) => {
        if ( pages.length ) {
          return Promise.all(
            pages.slice(0, 3).map((t) => loadSummary(t.title))
          )
        }
      })
};

export default defineComponent({
  components: {
    CdxTextInput,
    CdxCard,
    PageList
  },
  methods: {
    updateCards() {
      const query = this.query;
      loadSummary( query ).then( ( page ) => {
        if ( page) {
          this.selected = page;
        }
        getMostLinked( [ query, query ] ).then( (pages) => {
        if ( pages && pages.length ) {
          getMostLinked( [ query ].concat( pages.map((p) => p.title) ) ).then( ( pages2 ) => {
            if ( this.query !== query ) {
              // a newer query exists.
              return;
            }
            this.pages = pages;
            this.pages2 = pages2;
          })
        }
      } );
      } );
    }
  },
  setup( props ) {
    const query = ref('');

    return {
      selected: null,
      query,
      pages,
      pages2
    };
  },
});
</script>
<style>
#app { padding: 8px; }
</style>
