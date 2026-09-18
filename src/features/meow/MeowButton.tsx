import { useTranslation } from 'react-i18next'
import { motion } from 'motion/react'
import { Cat as CatIcon, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { MeowState } from './useMeow'

export function MeowButton({ meow: { count, last, meow }, disabled }: { meow: MeowState; disabled: boolean }) {
  const { t } = useTranslation()
  return (
    <Button
      disabled={disabled}
      focusableWhenDisabled
      onClick={meow}
      className="lift h-14 gap-2.5 bg-orange-400 pr-5 pl-2 text-base font-semibold text-neutral-950 shadow-glow hover:bg-orange-300"
    >
      <motion.span
        key={`cat-${count}`}
        animate={count ? { rotate: [0, -14, 10, -6, 0] } : undefined}
        transition={{ duration: 0.5 }}
        className="chip size-10"
      >
        <CatIcon className="size-5 transition-transform duration-500 ease-pop motion-safe:group-hover/button:-translate-y-0.5 motion-safe:group-hover/button:scale-110 motion-safe:group-hover/button:-rotate-12" />
      </motion.span>
      {t('stack.meow')}
      <motion.span
        key={`vol-${count}`}
        animate={last ? { scale: [1, 1.25, 1] } : undefined}
        transition={{ duration: last?.length }}
        className="opacity-70 max-[400px]:hidden"
      >
        <Volume2 className="size-5" />
      </motion.span>
    </Button>
  )
}
