// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { KyberNetwork, Messages2, Calendar1, Kanban, Profile2User, Bill, UserSquare, ShoppingBag, Star } from 'iconsax-react';

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
  star: Star
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
      children: [
        {
          id: 'list',
          title: <FormattedMessage id="Energia" />,
          type: 'item',
          url: '/apps/contratti/list'
        },
        {
          id: 'details',
          title: <FormattedMessage id="Telefonia" />,
          type: 'item',
          url: '/apps/invoice/details/1'
        },
        {
          id: 'list',
          title: <FormattedMessage id="Altro" />,
          type: 'item',
          url: '/apps/invoice/list'
        },
      ]
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
      id: 'profile',
      title: <FormattedMessage id="profile" />,
      type: 'collapse',
      icon: icons.profile,
      children: [
        {
          id: 'user-profile',
          title: <FormattedMessage id="user-profile" />,
          type: 'item',
          url: '/apps/profiles/user/personal',
          breadcrumbs: false
        },
        {
          id: 'account-profile',
          title: <FormattedMessage id="account-profile" />,
          type: 'item',
          url: '/apps/profiles/account/basic'
        }
      ]
    },
  ]
};

export default applications;
