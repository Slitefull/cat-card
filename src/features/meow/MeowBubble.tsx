import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import {
  AudioLines,
  AudioWaveform,
  type LucideIcon,
  MessageCircleQuestionMark,
  Music,
  Music2,
  Sparkles,
} from 'lucide-react'
import type { Meow } from './meow'

const voiceIcons = {
  meow: Music2,
  mew: Sparkles,
  mrrow: AudioWaveform,
  mrrp: MessageCircleQuestionMark,
  meeow: AudioLines,
} satisfies Record<Meow['name'], LucideIcon>

export function MeowBubble({ count, last }: { count: number; last?: Meow }) {
  const { t } = useTranslation()
  const VoiceIcon = voiceIcons[last?.name ?? 'meow']

  return (
    <output className="pointer-events-none absolute inset-x-0 -top-16 z-10 flex justify-center short:top-3">
      {last && (
        <motion.span
          key={count}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0], y: [8, 0, -4, -24], scale: [0.6, 1.05, 1, 1] }}
          transition={{ duration: last.length + 1, times: [0, 0.2, 0.7, 1] }}
          className="relative flex items-center gap-2 rounded-full bg-orange-400 py-1.5 pr-5 pl-1.5 text-lg font-semibold tracking-tight text-neutral-950 shadow-glow after:absolute after:top-full after:left-1/2 after:size-3 after:-translate-x-1/2 after:-translate-y-1.5 after:rotate-45 after:rounded-[2px] after:bg-orange-400"
        >
          <span className="chip size-8">
            <VoiceIcon className="size-4" strokeWidth={2.5} />
          </span>
          {t(`stack.sounds.${last.name}`)}
          {([-1, 1] as const).map((side) => (
            <motion.span
              key={side}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0], x: side * 18, y: -26, rotate: side * 20 }}
              transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
              className={`absolute top-0 text-orange-500 dark:text-orange-300 ${side < 0 ? 'left-2' : 'right-2'}`}
            >
              <Music className="size-4" strokeWidth={2.5} />
            </motion.span>
          ))}
        </motion.span>
      )}
    </output>
  )
}
