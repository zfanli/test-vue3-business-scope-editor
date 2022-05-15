import { onMounted, onUnmounted } from 'vue'

export function useShortcuts({ handleUndo, handleRedo }) {
  const isAppleDevice = window.navigator.userAgent.includes('mac')

  const getFnKey = (key) => {
    switch (key) {
      case 'ctrl':
        return isAppleDevice ? 'cmd' : 'ctrl'
      default:
        return key
    }
  }

  const handleKeydown = (evt) => {
    if (evt.isComposing || evt.keyCode === 229) return
    if (document.activeElement !== document.body) return

    switch (evt.key) {
      case 'z':
      case 'Z':
        if (evt.shiftKey && (evt.metaKey || evt.ctrlKey)) handleRedo()
        else if (evt.metaKey || evt.ctrlKey) handleUndo()
        break
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
    console.log('registered')
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeydown)
    console.log('unregistered')
  })

  return {
    shortcuts: [
      {
        name: '撤销',
        keys: [getFnKey('ctrl'), 'z'],
      },
      {
        name: '重做',
        keys: [getFnKey('ctrl'), 'shift', 'z'],
      },
      {
        name: '多选',
        keys: [getFnKey('ctrl'), 'left click'],
      },
    ],
  }
}
