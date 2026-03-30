interface ISiteMetadataResult {
  siteTitle: "Rick's Runs";
  siteUrl: string;
  description: string;
  logo: string;
  navLinks: {
    name: string;
    url: string;
  }[];
}

const getBasePath = () => {
  const baseUrl = import.meta.env.BASE_URL;
  return baseUrl === '/' ? '' : baseUrl;
};

const data: ISiteMetadataResult = {
  siteTitle: "Rick's Runs",
  siteUrl: '',
  logo: '/images/9B36C672-6724-46B1-A310-BC2136D66250.png',
  description: '',
  navLinks: [
    {
      name: 'Summary',
      url: `${getBasePath()}/summary`,
    },
    {
      name: 'Blog',
      url: '',
    },
    {
      name: 'About',
      url: '',
    },
  ],
};

export default data;
