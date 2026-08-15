import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { DeleteMemberModal } from '../components/members/DeleteMemberModal'
import { MemberDetailModal } from '../components/members/MemberDetailModal'
import { MemberFormModal } from '../components/members/MemberFormModal'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { isApiError, listMembers } from '../lib/api'
import type { Member } from '../lib/api'

type MemberModalState =
  | { kind: 'create' }
  | { kind: 'delete'; member: Member }
  | { kind: 'detail'; member: Member }
  | { kind: 'edit'; member: Member }
  | null

export function MembersPage() {
  const { t } = useTranslation()
  const { token } = useAuth()
  const { showToast } = useToast()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<MemberModalState>(null)
  const [formSession, setFormSession] = useState(0)
  const mountedRef = useRef(true)

  const loadMembers = useCallback(async () => {
    if (!token) return

    try {
      const { members: nextMembers } = await listMembers(token)
      if (!mountedRef.current) return
      setMembers(nextMembers)
    } catch (error) {
      if (!mountedRef.current) return
      showToast(
        isApiError(error) ? error.message : t('auth.errorUnexpected'),
        'error',
      )
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [showToast, t, token])

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!token) return

    let cancelled = false

    listMembers(token)
      .then(({ members: nextMembers }) => {
        if (cancelled) return
        setMembers(nextMembers)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        showToast(
          isApiError(error) ? error.message : t('auth.errorUnexpected'),
          'error',
        )
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [showToast, t, token])

  const handleSaved = (mode: 'create' | 'update') => {
    setModal(null)
    showToast(
      mode === 'create'
        ? t('members.createSuccess')
        : t('members.updateSuccess'),
      'success',
    )
    void loadMembers()
  }

  const handleDeleted = () => {
    setModal(null)
    showToast(t('members.deleteSuccess'), 'success')
    void loadMembers()
  }

  const openCreate = () => {
    setFormSession((current) => current + 1)
    setModal({ kind: 'create' })
  }

  const openEdit = (member: Member) => {
    setFormSession((current) => current + 1)
    setModal({ kind: 'edit', member })
  }

  const iconButtonClass =
    'grid size-8 place-items-center text-slate-500 transition hover:text-cyan-600 dark:text-slate-400 dark:hover:text-cyan-400'

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight">
          {t('members.title')}
        </h1>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 bg-cyan-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-700"
        >
          <Plus className="size-4" aria-hidden="true" />
          {t('members.add')}
        </button>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
          {t('members.loading')}
        </p>
      ) : members.length === 0 ? (
        <p className="py-10 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
          {t('members.empty')}
        </p>
      ) : (
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t('members.colNo')}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t('members.colCode')}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t('members.colName')}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t('members.colEmail')}
                </th>
                <th scope="col" className="px-4 py-3 font-semibold">
                  {t('members.colActions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {members.map((member, index) => (
                <tr key={member.id}>
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3 font-semibold">
                    {member.membershipCode ?? '—'}
                  </td>
                  <td className="px-4 py-3">{member.name}</td>
                  <td className="px-4 py-3">{member.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setModal({ kind: 'detail', member })}
                        aria-label={t('members.actionView')}
                        className={iconButtonClass}
                      >
                        <Eye className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(member)}
                        aria-label={t('members.actionEdit')}
                        className={iconButtonClass}
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setModal({ kind: 'delete', member })}
                        aria-label={t('members.actionDelete')}
                        className={`${iconButtonClass} hover:text-rose-600 dark:hover:text-rose-400`}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <MemberFormModal
        key={formSession}
        open={modal?.kind === 'create' || modal?.kind === 'edit'}
        mode={modal?.kind === 'edit' ? 'update' : 'create'}
        member={modal?.kind === 'edit' ? modal.member : null}
        onClose={() => setModal(null)}
        onSaved={() =>
          handleSaved(modal?.kind === 'edit' ? 'update' : 'create')
        }
      />
      <MemberDetailModal
        open={modal?.kind === 'detail'}
        member={modal?.kind === 'detail' ? modal.member : null}
        onClose={() => setModal(null)}
      />
      <DeleteMemberModal
        open={modal?.kind === 'delete'}
        member={modal?.kind === 'delete' ? modal.member : null}
        onClose={() => setModal(null)}
        onDeleted={handleDeleted}
      />
    </>
  )
}
