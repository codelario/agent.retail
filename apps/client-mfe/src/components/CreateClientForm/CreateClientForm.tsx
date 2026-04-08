import React, { useState } from 'react';
import { useClientsCommand } from '../../store/useClientsCommand';
import { logger } from '@learning/logger';

interface CreateClientFormProps {
    onSuccess: () => void;
    authToken: string | null;
}

interface FormData {
    name: string;
    email: string;
    status: 'pending' | 'active' | 'inactive';
}

export const CreateClientForm = ({ onSuccess, authToken }: CreateClientFormProps) => {
    const { createClient, loading, error } = useClientsCommand(onSuccess);

    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        status: 'pending',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        logger.info('Submitting CreateClientForm', { formData });
        const client = { ...formData };
        createClient(client, authToken);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="name">Name:</label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
            </div>

            <div>
                <label htmlFor="email">Email:</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>

            <div>
                <label htmlFor="status">Status:</label>
                <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>
            </div>
            {loading && <p>Creating client...</p>}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            <button type="submit">Create Client</button>
        </form>
    );
};