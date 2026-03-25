import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { fetchData } from '../lib/data';

export default async function AcmeLogo() {

  var name = "";

  const companyName = await fetchData('companies');
  if (!companyName || Object.keys(companyName).length === 0) {
    name = "Vito inc.";
  }
  else {
    name = companyName[0].name;
  }


  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
    >
      {/* <GlobeAltIcon className="h-12 w-12 rotate-[15deg]" /> */}
      <p className="text-[44px]">{`${name}`}</p>
    </div>
  );
}
