export const en = {
  app: {
    subtitle: 'Digital Library',
  },
  actions: {
    changeLanguage: 'Change language',
    changeTheme: 'Change theme',
  },
  theme: {
    dark: 'Dark',
    light: 'Light',
  },
  navigation: {
    label: 'Main navigation',
    dashboard: 'Dashboard',
    books: 'Books',
    members: 'Members',
    loans: 'Loans',
  },
  dashboard: {
    eyebrow: "Today's overview",
    title: 'Manage the library in one workspace.',
    description:
      'Monitor collections, members, and loan activity through concise and easy-to-understand data.',
  },
  metrics: {
    label: 'Library statistics',
    books: 'Total books',
    members: 'Active members',
    activeLoans: 'Active loans',
    overdue: 'Overdue',
  },
  chart: {
    title: 'Loan status',
    description: 'Transaction distribution for the current period',
    borrowed: 'Borrowed',
    returned: 'Returned',
    overdue: 'Overdue',
  },
  activity: {
    title: 'Recent activity',
    loan: {
      title: 'A book was borrowed by Budi Santoso',
      time: '5 minutes ago',
    },
    return: {
      title: 'A book return was recorded',
      time: '18 minutes ago',
    },
    member: {
      title: 'A new member was registered',
      time: '42 minutes ago',
    },
  },
} as const
