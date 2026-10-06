<template>
  <!-- normal-case on root prevents CSS uppercase inheritance from th, labels, or buttons -->
  <div class="relative inline-block text-left normal-case tracking-normal font-normal">
    <!-- Trigger Button -->
    <button
      type="button"
      ref="triggerRef"
      @click.stop="toggle"
      class="h-5 w-5 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-blue-600 font-bold text-xs inline-flex items-center justify-center border border-slate-200 hover:border-blue-200 transition-all cursor-pointer normal-case"
      :class="{ 'bg-blue-600 text-white border-blue-600': isOpen }"
      title="Context Help"
      aria-haspopup="dialog"
      :aria-expanded="isOpen ? 'true' : 'false'"
    >
      ?
    </button>

    <!-- Clean, High-Legibility Card (Forced Normal Case) -->
    <!-- Teleported to <body> so the card escapes the table/overflow clipping
         contexts and gets clamped/flipped inside the viewport (positionPopover). -->
    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="popoverRef"
        :style="popoverStyle"
        class="fixed z-[9998] w-80 max-w-[calc(100vw-1rem)] p-4 bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-300 normal-case tracking-normal"
      >
        <!-- Header Row -->
        <div class="flex items-center justify-between -mx-4 -mt-4 mb-3 px-4 py-2.5 rounded-t-2xl bg-[#50756d] text-white">
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center justify-center h-5 w-5 rounded-full bg-[#302f28] text-white text-xs">  <!-- #86aca3 #302f28  #6e6d5b-->
              💡
            </span>
            <h5 class="text-xs font-bold text-white normal-case tracking-normal">
              {{ snippet.title }}
            </h5>
          </div>
          <button
            type="button"
            @click="isOpen = false"
            class="text-white/70 hover:text-white p-0.5 rounded-md transition-colors cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body Copy: Pure Sentence Casing & High Readability -->
          <div
              class="text-xs text-black leading-relaxed font-normal normal-case tracking-normal [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:mt-2"
              v-html="snippet.body"
          ></div>

        <!-- Footer -->
        <div class="mt-3 pt-2 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-500 font-medium normal-case">
          <span>JustXhale Document Pack Management</span>
          <span class="text-blue-600 font-semibold cursor-pointer hover:underline" @click="isOpen = false">Dismiss</span>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onBeforeUnmount } from 'vue';
import rawSnippets from '@/config/helpSnippets';

// Safe resolution whether imported as default or named export
const snippets = rawSnippets?.helpSnippets || rawSnippets || {};

const props = defineProps({
  topic: { type: String, required: true }
});

// Popover geometry. POPOVER_WIDTH mirrors the w-80 class and VIEWPORT_MARGIN
// keeps the card clear of the screen edges.
const POPOVER_WIDTH = 320;
const VIEWPORT_MARGIN = 8;

const isOpen = ref(false);
const triggerRef = ref(null);
const popoverRef = ref(null);
const popoverStyle = ref({});

const snippet = computed(() => snippets[props.topic] || {
  title: 'Guidance',
  body: 'Review operational parameters for this section.'
});

/**
 * Clamp/flip the teleported card so it always renders inside the viewport:
 *  - horizontally it prefers aligning its left edge to the trigger, flips to
 *    right-aligned when that would overflow, then clamps to the margins;
 *  - vertically it prefers sitting below the trigger, flipping above when there
 *    is not enough room.
 */
const positionPopover = () => {
  const trigger = triggerRef.value;
  if (!trigger) return;

  const rect = trigger.getBoundingClientRect();
  const width = Math.min(POPOVER_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2);
  const height = popoverRef.value?.offsetHeight || 0;

  let left = rect.left;
  if (left + width > window.innerWidth - VIEWPORT_MARGIN) {
    left = rect.right - width;
  }
  left = Math.max(VIEWPORT_MARGIN, Math.min(left, window.innerWidth - VIEWPORT_MARGIN - width));

  let top = rect.bottom + VIEWPORT_MARGIN;
  if (height && top + height > window.innerHeight - VIEWPORT_MARGIN) {
    top = Math.max(VIEWPORT_MARGIN, rect.top - VIEWPORT_MARGIN - height);
  }

  popoverStyle.value = { left: `${left}px`, top: `${top}px`, width: `${width}px` };
};

const onViewportChange = () => {
  if (isOpen.value) positionPopover();
};

const toggle = async () => {
  if (isOpen.value) {
    isOpen.value = false;
    return;
  }

  isOpen.value = true;
  await nextTick(); // Measure the card before positioning it
  positionPopover();
};

// Closing: a real outside-click/Escape handler replaces the inert
// @click.outside modifier and also covers the teleported card, which now lives
// outside this component's own DOM subtree.
const onDocumentPointerDown = (event) => {
  if (!isOpen.value) return;

  const target = event.target;
  const insideTrigger = target instanceof Node && triggerRef.value?.contains(target);
  const insidePopover = target instanceof Node && popoverRef.value?.contains(target);
  if (insideTrigger || insidePopover) return;

  isOpen.value = false;
};

const onKeydown = (event) => {
  if (event.key === 'Escape') isOpen.value = false;
};

watch(isOpen, (open) => {
  if (open) {
    window.addEventListener('resize', onViewportChange);
    // Capture phase: the host table can scroll inside an overflow container.
    window.addEventListener('scroll', onViewportChange, true);
    document.addEventListener('pointerdown', onDocumentPointerDown, true);
    document.addEventListener('keydown', onKeydown);
  } else {
    window.removeEventListener('resize', onViewportChange);
    window.removeEventListener('scroll', onViewportChange, true);
    document.removeEventListener('pointerdown', onDocumentPointerDown, true);
    document.removeEventListener('keydown', onKeydown);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', onViewportChange);
  window.removeEventListener('scroll', onViewportChange, true);
  document.removeEventListener('pointerdown', onDocumentPointerDown, true);
  document.removeEventListener('keydown', onKeydown);
});
</script>
