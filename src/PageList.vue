<template>
    <div>
        <div v-for="page in pages">
            <cdx-card :thumbnail="page.thumbnail"
            :class="cardClass"
            :url="page.url"
            :force-thumbnail="true">
            <template #title>
                {{ page.title }}
            </template>
            <template #description>
                <div v-html="page.extract_html"></div>
            </template>
            </cdx-card>
        </div>
    </div>
</template>
<script>
import {
  CdxCard
} from '@wikimedia/codex';
import { defineComponent } from 'vue';

export default defineComponent({
  components: {
    CdxCard
  },
  props: {
    pages: {
        type: Array,
        default: []
    }
  }
});
</script>
