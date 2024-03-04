// third-party
import { FormattedMessage } from 'react-intl';

// assets
import { Book, PasswordCheck, Next, RowVertical, CpuCharge, TableDocument, Subtitle } from 'iconsax-react';

// icons
const icons = {
  formsTable: Book,
  validation: PasswordCheck,
  wizard: Next,
  layout: RowVertical,
  plugins: CpuCharge,
  reactTables: TableDocument,
  muiTables: Subtitle
};

// ==============================|| MENU ITEMS - FORMS & TABLES ||============================== //

const formsTables = {
  id: 'group-forms-tables',
  title: <FormattedMessage id="forms-tables" />,
  icon: icons.formsTable,
  type: 'group',
  children: [
  ]

};

export default formsTables;
