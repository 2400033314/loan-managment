import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const ApplicationContext = createContext();

export const useApplications = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplications must be used within an ApplicationProvider');
  }
  return context;
};

export const ApplicationProvider = ({ children }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/applications');
      setApplications(response.data);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const createApplication = async (applicationData) => {
    try {
      const response = await api.post('/applications', applicationData);
      setApplications([...applications, response.data]);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to create application' 
      };
    }
  };

  const updateApplication = async (id, applicationData) => {
    try {
      const response = await api.put(`/applications/${id}`, applicationData);
      setApplications(applications.map(app => 
        app.id === id ? response.data : app
      ));
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update application' 
      };
    }
  };

  const deleteApplication = async (id) => {
    try {
      await api.delete(`/applications/${id}`);
      setApplications(applications.filter(app => app.id !== id));
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to delete application' 
      };
    }
  };

  const getApplication = async (id) => {
    try {
      const response = await api.get(`/applications/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to fetch application' 
      };
    }
  };

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const value = {
    applications,
    loading,
    fetchApplications,
    createApplication,
    updateApplication,
    deleteApplication,
    getApplication
  };

  return (
    <ApplicationContext.Provider value={value}>
      {children}
    </ApplicationContext.Provider>
  );
};

