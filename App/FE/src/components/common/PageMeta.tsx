import { HelmetProvider, Helmet } from "react-helmet-async";
import { useSettings } from "@/hooks/react-query/useSettings";

const PageMeta = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => {
  const { data: settings } = useSettings();

  const storeName = settings?.store_name?.value || "Gagal-Lapar";

  return (
    <Helmet>
      <title>{`${title} | ${storeName ?? "STORE_NAME"}`}</title>
      <meta name="description" content={description} />      
      {settings?.favicon && (
        <link rel="icon" href={`${import.meta.env.VITE_STORAGE_URL}/${settings.logo_light.value}`} />
      )}
    </Helmet>
  );
};

export const AppWrapper = ({ children }: { children: React.ReactNode }) => (
  <HelmetProvider>{children}</HelmetProvider>
);

export default PageMeta;