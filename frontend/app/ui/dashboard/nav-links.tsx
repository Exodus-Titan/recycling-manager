'use client';
import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  CircleStackIcon,
  GlobeAmericasIcon,
  TruckIcon,
  TicketIcon,
  PencilSquareIcon,
  NewspaperIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  
  { name: 'Proveedores', href: '/dashboard/providers', icon: UserGroupIcon },
  { name: 'Direcciones', href: '/dashboard/providers/addresses', icon: GlobeAmericasIcon },
  { name: 'Vehiculos', href: '/dashboard/providers/vehicles', icon: TruckIcon },
  { name: 'Materiales', href: '/dashboard/materials', icon: CircleStackIcon },
  { name: 'Tickets', href: '/dashboard/tickets', icon: TicketIcon },
  { name: 'Guias', href: '/dashboard/guides', icon: DocumentDuplicateIcon,},
  { name: 'Notas de Entrega', href: '/dashboard/delivery-notes', icon: NewspaperIcon },
  { name: 'Declaracion Jurada', href: '/dashboard/affidavits', icon: PencilSquareIcon },

];

export default function NavLinks() {
  const pathname = usePathname();
  
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={`flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm 
                        font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3
                        ${pathname === link.href ? 'bg-sky-100 text-blue-600' : 'text-gray-700'}
                        `}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
