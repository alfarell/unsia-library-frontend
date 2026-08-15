import { useTranslation } from 'react-i18next'
import type { Member } from '../../lib/api'
import { Modal } from '../ui/Modal'

type MemberDetailModalProps = {
  member: Member | null
  onClose: () => void
  open: boolean
}

export function MemberDetailModal({
  member,
  onClose,
  open,
}: MemberDetailModalProps) {
  const { i18n, t } = useTranslation()

  if (!member) {
    return null
  }

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(i18n.language).format(new Date(value))

  const rows = [
    { key: 'name', label: t('members.detail.name'), value: member.name },
    { key: 'email', label: t('members.detail.email'), value: member.email },
    {
      key: 'membershipCode',
      label: t('members.detail.membershipCode'),
      value: member.membershipCode,
    },
    { key: 'phone', label: t('members.detail.phone'), value: member.phone },
    {
      key: 'address',
      label: t('members.detail.address'),
      value: member.address,
    },
    {
      key: 'createdBy',
      label: t('members.detail.createdBy'),
      value: member.createdBy?.name,
    },
    {
      key: 'updatedBy',
      label: t('members.detail.updatedBy'),
      value: member.updatedBy?.name,
    },
    {
      key: 'createdAt',
      label: t('members.detail.createdAt'),
      value: formatDate(member.createdAt),
    },
    {
      key: 'updatedAt',
      label: t('members.detail.updatedAt'),
      value: formatDate(member.updatedAt),
    },
  ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('members.detail.detailTitle')}
    >
      <dl className="divide-y divide-slate-200 dark:divide-slate-800">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex items-start justify-between gap-4 py-2"
          >
            <dt className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {row.label}
            </dt>
            <dd className="text-right text-sm font-medium">
              {row.value ?? '—'}
            </dd>
          </div>
        ))}
      </dl>
    </Modal>
  )
}
