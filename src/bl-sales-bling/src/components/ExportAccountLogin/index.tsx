import { useState, FormEvent } from 'react';
import { useAuthExportAccount } from '../../context/AuthExportAccountContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { User } from '../../model/auth';

interface InputLoginExportAccount {
    user: User
}

const LoginExportAccount: React.FC<InputLoginExportAccount> = ({ user }) => {
    const [profile, setProfile] = useState<string>('');
    const [key, setKey] = useState<string>('');
    const [error, setError] = useState<string>('');
    const { loginExportAccount, isAuthenticated, loading } = useAuthExportAccount();
    const navigate = useNavigate();

    // Redirect if already authenticated
    if (!loading && isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = (e: FormEvent): void => {
        e.preventDefault();
        setError('');

        setProfile(profile?.trim().toLocaleLowerCase())
        // Basic token validation
        if (!profile.trim()) {
            setError('Insira um perfil.');
            return;
        }

        if (key.length < 10) {
            setError('Chave deve conter no mínimo 10 caracteres.');
            return;
        }

        // Login user
        loginExportAccount(profile, key);
        navigate('/');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4">
                    {/** Add here a static form, with already set data from 'user' */}
                    <div className="card shadow-sm mt-5">
                        <div className="card-body">
                            <div className="user-info">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">Nome:</label>
                                    <p className="form-control-static">{user.profile || 'Não informado'}</p>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label fw-bold">Chave:</label>
                                    <p className="form-control-static">****************</p>
                                </div>
                            </div>

                            <div className="alert alert-info mt-4">
                                <small>
                                    <i className="bi bi-info-circle me-2"></i>
                                    Estas são suas informações de conta. Para acessar a exportação,
                                    preencha os dados de autenticação específicos no formulário ao lado.
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 col-lg-4">
                    <div className="card shadow-sm mt-5">
                        <div className="card-body">
                            <h2 className="card-title text-center mb-4">Exportar para</h2>


                            <form onSubmit={handleSubmit}>

                                {error && (
                                    <div className="invalid-feedback">
                                        {error}
                                    </div>
                                )}

                                <div className="mb-3">
                                    <label htmlFor="profile" className="form-label">
                                        Perfil
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control ${error ? 'is-invalid' : ''}`}
                                        id="iprofile"
                                        value={profile}
                                        onChange={(e) => setProfile(e.target.value)}
                                        placeholder="Coloque o seu perfil."
                                        aria-describedby="profileHelp"
                                    />
                                </div>


                                <div className="mb-3">
                                    <label htmlFor="key" className="form-label">
                                        Chave
                                    </label>
                                    <input
                                        type="password"
                                        className={`form-control ${error ? 'is-invalid' : ''}`}
                                        id="ikey"
                                        value={key}
                                        onChange={(e) => setKey(e.target.value)}
                                        placeholder="Coloque a chave principal"
                                        aria-describedby="keyHelp"
                                    />
                                    <div id="keyHelp" className="form-text">
                                        Chave deve conter no mínimo 10 caracteres.
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary w-100"
                                    disabled={(!profile.trim() && key.length < 10)}>
                                    Login
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginExportAccount;