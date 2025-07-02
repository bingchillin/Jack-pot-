'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import { Package, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Order } from '@/interfaces/order.interface';
import { Return, CreateReturnRequest } from '@/interfaces/return.interface';
import { returnService } from '@/services/return.service';
import { isReturnEligible, getDaysUntilReturnExpiry, getReturnStatusColor, getReturnStatusText } from '@/utils/return.utils';

interface ReturnSectionProps {
  order: Order;
  locale: string;
}

export default function ReturnSection({ order, locale }: ReturnSectionProps) {
  const t = useTranslations("returns");
  const [returnData, setReturnData] = useState<Return | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [reason, setReason] = useState('');

  const eligibility = isReturnEligible(order);
  const daysLeft = order.deliveredAt ? getDaysUntilReturnExpiry(order.deliveredAt) : 0;

  useEffect(() => {
    loadReturn();
  }, [order.idOrder]);

  const loadReturn = async () => {
    try {
      const data = await returnService.getReturnByOrderId(order.idOrder);
      setReturnData(data);
    } catch (error) {
      console.error('Failed to load return data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReturn = async () => {
    if (!eligibility.eligible) return;

    try {
      setRequesting(true);
      const data: CreateReturnRequest = { reason: reason.trim() || undefined };
      const newReturn = await returnService.createReturn(order.idOrder, data);
      
      setReturnData(newReturn);
      setShowReturnForm(false);
      setReason('');
      toast.success(t('request_submitted'));
    } catch (error: any) {
      console.error('Failed to request return:', error);
      toast.error(error.message || t('request_failed'));
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2">
          <Package className="w-5 h-5 text-gray-400" />
          <span className="text-gray-500">{t('loading')}</span>
        </div>
      </div>
    );
  }

  // Don't show return section if order isn't eligible and no return exists
  if (!eligibility.eligible && !returnData) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Package className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">{t('title')}</h3>
        </div>
      </div>

      {returnData ? (
        // Return already exists - show status
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {returnData.status === 'requested' ? (
                <Clock className="w-5 h-5 text-yellow-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  {getReturnStatusText(returnData.status, locale)}
                </p>
                <p className="text-sm text-gray-600">
                  {t('requested_on', { 
                    date: new Date(returnData.createdAt).toLocaleDateString(locale) 
                  })}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getReturnStatusColor(returnData.status)}`}>
              {getReturnStatusText(returnData.status, locale)}
            </span>
          </div>

          {returnData.reason && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">{t('reason')}</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{returnData.reason}</p>
            </div>
          )}

          {returnData.status === 'requested' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">{t('return_instructions.title')}</h4>
              <div className="space-y-2 text-sm text-blue-800">
                <p>{t('return_instructions.step_1')}</p>
                <div className="bg-white border border-blue-200 rounded p-3 font-mono text-xs">
                  <div className="font-bold mb-1">{t('return_address')}</div>
                  <div>Jack Pot</div>
                  <div>123 Rue de la Technologie</div>
                  <div>75001 Paris, France</div>
                </div>
                <p>{t('return_instructions.step_2')}</p>
                <p>{t('return_instructions.step_3')}</p>
              </div>
            </div>
          )}

          {returnData.status === 'received' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-900">{t('refund_processed')}</h4>
              </div>
              <p className="text-sm text-green-800">
                {t('refund_info', { amount: `${order.totalAmount.toFixed(2)} ${order.currency}` })}
              </p>
              {returnData.refundedAt && (
                <p className="text-xs text-green-700 mt-1">
                  {t('refunded_on', { 
                    date: new Date(returnData.refundedAt).toLocaleDateString(locale) 
                  })}
                </p>
              )}
            </div>
          )}
        </div>
      ) : eligibility.eligible ? (
        // No return exists but eligible - show return option
        <div className="space-y-4">
          {daysLeft <= 3 && (
            <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
              <p className="text-sm text-yellow-800">
                {t('expiry_warning', { days: daysLeft })}
              </p>
            </div>
          )}

          {!showReturnForm ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">{t('eligible_message')}</p>
              <button
                onClick={() => setShowReturnForm(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Package className="w-4 h-4 mr-2" />
                {t('request_return')}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label htmlFor="return-reason" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('reason_optional')}
                </label>
                <textarea
                  id="return-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={t('reason_placeholder')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleRequestReturn}
                  disabled={requesting}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  {requesting ? (
                    <>
                      <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      {t('requesting')}
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 mr-2" />
                      {t('submit_request')}
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowReturnForm(false);
                    setReason('');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Not eligible
        <div className="text-center text-gray-500">
          <p>{t('not_eligible')}</p>
          {eligibility.reason && (
            <p className="text-sm text-gray-400 mt-1">{eligibility.reason}</p>
          )}
        </div>
      )}
    </div>
  );
} 