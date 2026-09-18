import { useTranslation } from 'react-i18next'
import { Heart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MeowButton } from '@/features/meow/MeowButton'
import type { MeowState } from '@/features/meow/useMeow'
import type { Direction } from './useCatDeck'

type Props = { disabled: boolean; onSwipe: (dir: Direction) => void; meow: MeowState }

const column = 'grid justify-items-center gap-1.5'
const caption = 'flex w-0 justify-center text-xs font-medium whitespace-nowrap text-muted-foreground'

export function StackControls({ disabled, onSwipe, meow }: Props) {
  const { t } = useTranslation()
  return (
    <div className="flex items-start gap-4 max-[400px]:gap-3 short:flex-col short:items-center">
      <div className={column}>
        <Button
          variant="outline"
          size="icon"
          aria-label={t('stack.nope')}
          aria-keyshortcuts="ArrowLeft"
          disabled={disabled}
          focusableWhenDisabled
          onClick={() => onSwipe(-1)}
          className="lift size-14 bg-white max-[360px]:size-12 dark:bg-neutral-900"
        >
          <X className="size-6 transition-transform duration-500 ease-pop motion-safe:group-hover/button:rotate-90" />
        </Button>
        <span aria-hidden="true" className={caption}>
          {t('stack.nope')}
        </span>
      </div>
      <MeowButton meow={meow} disabled={disabled} />
      <div className={column}>
        <Button
          variant="outline"
          size="icon"
          aria-label={t('stack.like')}
          aria-keyshortcuts="ArrowRight"
          disabled={disabled}
          focusableWhenDisabled
          onClick={() => onSwipe(1)}
          className="lift size-14 bg-white text-orange-600 max-[360px]:size-12 hover:text-orange-600 dark:bg-neutral-900 dark:text-orange-400 dark:hover:text-orange-400"
        >
          <Heart className="size-6 transition-[transform,fill] duration-500 ease-pop group-hover/button:fill-current motion-safe:group-hover/button:scale-125" />
        </Button>
        <span aria-hidden="true" className={caption}>
          {t('stack.like')}
        </span>
      </div>
    </div>
  )
}
