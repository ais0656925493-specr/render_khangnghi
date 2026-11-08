import HelpClient from './help-client';
import { getInitialLang } from './get-initial-lang';

const HelpPage = async () => {
    const initialLang = await getInitialLang();
    return <HelpClient initialLang={initialLang} />;
};

export default HelpPage;
