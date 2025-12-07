import { StrictMode } from 'react';
import { router } from './core/router/router'
import AppProviders from './presentation/wrapper/providers/AppProviders';
import { RouterProvider } from 'react-router';

const App = () => {
    return (
        <StrictMode>
            <AppProviders>
                <RouterProvider router={router} />
            </AppProviders>
        </StrictMode>
    );
};

export default App;
