'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import { Package, CheckCircle, Clock } from 'lucide-react';
import { Return } from '@/interfaces/return.interface';
import { returnService } from '@/services/return.service';
import { getReturnStatusColor, getReturnStatusText } from '@/utils/return.utils';

interface ReturnManagementProps {
  locale: string;
}

export default function ReturnManagement({ locale }: ReturnManagementProps) {
  const t = useTranslations();
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    loadReturns();
  }, []);

  const loadReturns = async () => {
    try {
      const data = await returnService.getAllReturns();
      setReturns(data);
    } catch (error) {
      console.error('Failed to load returns:', error);
      toast.error('Failed to load returns');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsReceived = async (returnId: number) => {
    try {
      setProcessing(returnId);
      const updatedReturn = await returnService.markAsReceived(returnId);
      
      // Update the return in the list
      setReturns(returns.map(r => 
        r.idReturn === returnId ? updatedReturn : r
      ));
      
      toast.success('Return marked as received and refund processed');
    } catch (error: any) {
      console.error('Failed to mark return as received:', error);
      toast.error(error.message || 'Failed to process return');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2">
          <Package className="w-5 h-5 text-gray-400" />
          <span className="text-gray-500">Loading returns...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Package className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Return Management</h3>
        </div>
      </div>

      {returns.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p>No returns to manage</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {returns.map((returnItem) => (
            <div key={returnItem.idReturn} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {returnItem.status === 'requested' ? (
                    <Clock className="w-5 h-5 text-yellow-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      Return #{returnItem.idReturn} - Order #{returnItem.idOrder}
                    </p>
                    <p className="text-sm text-gray-600">
                      Requested on {new Date(returnItem.createdAt).toLocaleDateString(locale)}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getReturnStatusColor(returnItem.status)}`}>
                  {getReturnStatusText(returnItem.status, locale)}
                </span>
              </div>

              {returnItem.reason && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-1">Reason:</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{returnItem.reason}</p>
                </div>
              )}

              {returnItem.status === 'requested' && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <p><strong>Instructions for customer:</strong> Ship to company address at their own expense</p>
                  </div>
                  <button
                    onClick={() => handleMarkAsReceived(returnItem.idReturn)}
                    disabled={processing === returnItem.idReturn}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {processing === returnItem.idReturn ? (
                      <>
                        <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Received
                      </>
                    )}
                  </button>
                </div>
              )}

              {returnItem.status === 'received' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h4 className="font-medium text-green-900">Return Processed</h4>
                  </div>
                  <div className="text-sm text-green-800">
                    <p>Return received on: {returnItem.receivedAt && new Date(returnItem.receivedAt).toLocaleDateString(locale)}</p>
                    {returnItem.refundedAt && (
                      <p>Refund processed on: {new Date(returnItem.refundedAt).toLocaleDateString(locale)}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 