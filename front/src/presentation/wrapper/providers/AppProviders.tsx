import { ReactQueryProvider } from "./query/ReactQueryProvider";

interface Props {
  children: React.ReactNode;
}

const allProviders: Record<
  string,
  React.ComponentType<{ children: React.ReactNode }>
> = {
  reactQuery: ReactQueryProvider,
};

const providerOrder = ["reactQuery"];

const AppProviders = ({ children }: Props) => {
  return providerOrder.reduceRight((acc, key) => {
    const Provider = allProviders[key];
    if (!Provider) {
      console.warn(`Provider "${key}" is not registered in allProviders`);
      return acc;
    }
    return <Provider>{acc}</Provider>;
  }, children);
};

export default AppProviders;
