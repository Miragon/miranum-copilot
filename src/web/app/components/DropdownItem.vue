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
    flex-direction: column;
    gap: 4px;
    align-items: start;
    padding: 0.5rem;
    cursor: pointer;
}

.prefix {
    color: #666;
}
</style>
