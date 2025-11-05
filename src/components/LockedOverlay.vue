<template>
    <div class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gray-300 bg-opacity-75">
        <svg class="w-16 h-16 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
        <h2 class="mt-4 text-2xl font-bold text-gray-800">Estate is Locked</h2>
        <p class="mt-2 text-lg text-gray-600">
            This estate is currently being worked on by
            <span class="font-semibold">{{ lockedByUser }}.</span>
        </p>
        <p class="mt-1 text-sm text-gray-500">
            The file will be available once they are finished.
        </p>
    </div>
</template>

<script setup>
defineProps({
    lockedByUser: {
        type: String,
        required: true,
        default: 'another user'
    }
});
</script>