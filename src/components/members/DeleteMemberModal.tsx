import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { deleteMember, isApiError } from '../../lib/api'
import type { Member } from '../../lib/api'
import { Modal } from '../ui/Modal'

type DeleteMemberModalProps = {
  member: Member | null
  onClose: () => void
  onDeleted: () => void
  open: boolean
}

export function DeleteMemberModal({
  member,
  onClose,
  onDeleted,
  open,
}: DeleteMemberModalProps) {
  const { t } = useTranslation()
  const { token } = useAuth()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleDelete = async () => {
    if (!token || !member) return

    setIsSubmitting(true)

    try {
      await deleteMember(token, member.id)
      onDeleted()
    } catch (error) {
      showToast(
        isApiError(error) ? error.message : t('auth.errorUnexpected'),
        'error',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('members.confirm.deleteTitle')}
    >
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {t('members.confirm.deleteConfirm', { name: member?.name ?? '' })}
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="border border-slate-300 px-4 py-2 text-sm font-semibold transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:border-slate-600"
        >
          {t('members.form.cancel')}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isSubmitting}
          className="bg-rose-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? t('members.loading')
            : t('members.confirm.deleteButton')}
        </button>
      </div>
    </Modal>
  )
}
