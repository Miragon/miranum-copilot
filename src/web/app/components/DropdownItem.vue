<script lang="ts" setup>
import { computed } from "vue";

interface Props {
    prefix: string;
    name: string;
}

const props = defineProps<Props>();

const prefix = computed(() => props.prefix);
const name = computed(() => props.name);
</script>

<template>
    <div class="item">
        <span class="prefix">{{ prefix }}: </span>
        <span class="name">{{ name }}</span>
    </div>
</template>

<style scoped>
.item {
    display: flex;
    flex-direction: row;
    gap: 0.3rem;
    padding-top: 0.1rem;
    padding-bottom: 0.1rem;
}

.prefix {
    color: #666;
}
</style>
