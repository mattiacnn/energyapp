// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { KyberNetwork, Messages2, Calendar1, Kanban, Profile2User, Bill, UserSquare, ShoppingBag, Star, CardAdd, DocumentText } from 'iconsax-react';

// icons
const icons = {
  applications: KyberNetwork,
  chat: Messages2,
  calendar: Calendar1,
  kanban: Kanban,
  customer: Profile2User,
  invoice: Bill,
  profile: UserSquare,
  ecommerce: ShoppingBag,
  star: Star,
  card: CardAdd,
  archive: DocumentText
};

// ==============================|| MENU ITEMS - APPLICATIONS ||============================== //

const applications = {
  id: 'group-applications',
  title: <FormattedMessage id="applications" />,
  icon: icons.applications,
  type: 'group',
  children: [
    {
      id: 'customer',
      title: <FormattedMessage id="Anagrafica" />,
      type: 'collapse',
      icon: icons.customer,
      children: [
        {
          id: 'customer-list',
          title: <FormattedMessage id="Agenti" />,
          type: 'item',
          url: '/apps/customer/agents-list'
        },
        {
          id: 'customer-card',
          title: <FormattedMessage id="Clienti" />,
          type: 'item',
          url: '/apps/customer/customer-list'
        }
      ]
    },
    {
      id: 'invoice',
      title: <FormattedMessage id="Contratti" />,
      url: '/apps/contratti/list',
      type: 'collapse',
      icon: icons.invoice,
      breadcrumbs: true,
    },
    {
      id: 'rates',
      title: <FormattedMessage id="Tariffe" />,
      url: '/apps/rates/rates-list',
      type: 'collapse',
      icon: icons.star,
      breadcrumbs: true,
    },
    {
      id: 'contract-types',
      title: <FormattedMessage id="Tipi di contratto" />,
      url: '/apps/contract-types/contract-types-list',
      type: 'collapse',
      icon: icons.archive,
      breadcrumbs: true,
    },
    {
      id: 'providers',
      title: <FormattedMessage id="Fornitori" />,
      url: '/apps/providers/providers-list',
      type: 'collapse',
      icon: icons.archive,
      breadcrumbs: true,
    },
    {
      id: 'methods',
      title: <FormattedMessage id="Metodi di pagamento" />,
      url: '/apps/methods/methods-list',
      type: 'collapse',
      icon: icons.card,
      breadcrumbs: true,
    },
  ]
};

export default applications;
