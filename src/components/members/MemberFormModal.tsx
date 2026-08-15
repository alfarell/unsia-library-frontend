import { useState } from 'react'
import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { createMember, isApiError, updateMember } from '../../lib/api'
import type { Member, MemberPayload } from '../../lib/api'
import { Modal } from '../ui/Modal'

type MemberFormModalProps = {
  member?: Member | null
  mode: 'create' | 'update'
  onClose: () => void
  onSaved: () => void
  open: boolean
}

type FormErrors = {
  email?: string
  name?: string
}

export function MemberFormModal({
  member,
  mode,
  onClose,
  onSaved,
  open,
}: MemberFormModalProps) {
  const { t } = useTranslation()
  const { token } = useAuth()
  const { showToast } = useToast()
  const [name, setName] = useState(member?.name ?? '')
  const [email, setEmail] = useState(member?.email ?? '')
  const [phone, setPhone] = useState(member?.phone ?? '')
  const [address, setAddress] = useState(member?.address ?? '')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = (payload: MemberPayload) => {
    const next: FormErrors = {}

    if (!payload.name) {
      next.name = t('members.form.validation.nameRequired')
    }

    if (!payload.email) {
      next.email = t('members.form.validation.emailRequired')
    } else if (!/^\S+@\S+\.\S+$/.test(payload.email)) {
      next.email = t('members.form.validation.emailInvalid')
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token) return

    const payload: MemberPayload = {}

    if (name.trim()) payload.name = name.trim()
    if (email.trim()) payload.email = email.trim()
    if (phone.trim()) payload.phone = phone.trim()
    if (address.trim()) payload.address = address.trim()

    if (!validate(payload)) return

    setIsSubmitting(true)

    try {
      if (mode === 'create') {
        await createMember(token, payload)
      } else if (member) {
        await updateMember(token, member.id, payload)
      }
      onSaved()
    } catch (error) {
      showToast(
        isApiError(error) ? error.message : t('auth.errorUnexpected'),
        'error',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass =
    'w-full border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-cyan-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        mode === 'create'
          ? t('members.form.createTitle')
          : t('members.form.editTitle')
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div>
          <label
            htmlFor="member-name"
            className="mb-1.5 block text-sm font-semibold"
          >
            {t('members.form.nameLabel')}
          </label>
          <input
            id="member-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('members.form.namePlaceholder')}
            aria-invalid={Boolean(errors.name)}
            className={inputClass}
          />
          {errors.name ? (
            <p
              role="alert"
              className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400"
            >
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="member-email"
            className="mb-1.5 block text-sm font-semibold"
          >
            {t('members.form.emailLabel')}
          </label>
          <input
            id="member-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t('members.form.emailPlaceholder')}
            aria-invalid={Boolean(errors.email)}
            className={inputClass}
          />
          {errors.email ? (
            <p
              role="alert"
              className="mt-1 text-xs font-medium text-rose-600 dark:text-rose-400"
            >
              {errors.email}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="member-phone"
            className="mb-1.5 block text-sm font-semibold"
          >
            {t('members.form.phoneLabel')}
          </label>
          <input
            id="member-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder={t('members.form.phonePlaceholder')}
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="member-address"
            className="mb-1.5 block text-sm font-semibold"
          >
            {t('members.form.addressLabel')}
          </label>
          <input
            id="member-address"
            type="text"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder={t('members.form.addressPlaceholder')}
            className={inputClass}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="border border-slate-300 px-4 py-2 text-sm font-semibold transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:hover:border-slate-600"
          >
            {t('members.form.cancel')}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-cyan-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? t('members.loading')
              : mode === 'create'
                ? t('members.form.save')
                : t('members.form.update')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
