import HomePage from '@/components/HomePage';
import { getInitialLang } from '../get-initial-lang';

const CommunityStandardsPage = async () => {
    const initialLang = await getInitialLang();
    return <HomePage initialLang={initialLang} />;
};

export default CommunityStandardsPage;
