import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { useAuthExportAccount } from '../../context/AuthExportAccountContext';
import { useEffect, useState } from 'react';
import LoadingComponent from '../../components/LoadingComponent';
import { useNavigate } from 'react-router-dom';

interface QueryParams {
    [key: string]: string;
}

const RedirectAuth: React.FC = () => {
    const navigate = useNavigate();
    const { login, logout } = useAuth();
    const { setExportConfig, loginExportAccount, logoutExportAccount } = useAuthExportAccount();

    useEffect(() => {

        try {
            try {
                logout();
            } catch {

            }
            try {
                logoutExportAccount();
            } catch {

            }

            const searchParams = new URLSearchParams(window.location.search);
            const params: QueryParams = {};

            searchParams.forEach((value, key) => {
                params[key] = value;
            });

            let profile = params["profile"]
            let profileKey = params["profileKey"]
            let profileExport = params["profileExport"]
            let profileExportKey = params["profileExportKey"]
            let exportStoreId: number | undefined = parseInt(params["exportStoreId"])
            let exportStatusId: number | undefined = parseInt(params["exportStatusId"])

            console.log({
                profile,
                profileExport,
                exportStoreId,
                exportStatusId
            });

            if (!profile || profile === '') return;
            if (!profileKey || profileKey === '') return;

            login(profile, profileKey);

            if (!profileExport || profileExport === '') return;
            if (!profileExportKey || profileExportKey === '') return;

            loginExportAccount(profileExport, profileExportKey);

            if (exportStoreId <= 0) exportStoreId = undefined
            if (exportStatusId <= 0) exportStatusId = undefined

            if (!exportStatusId && !exportStatusId) return;

            setExportConfig(exportStoreId, exportStatusId);
        }
        finally {
            navigate('/');
        }

    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            <LoadingComponent />
        </div>
    );
};

export default RedirectAuth;