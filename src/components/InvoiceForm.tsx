'use client';

import React from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { InvoiceData } from '@/types/invoice';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const generateInvoiceNumber = () => {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `NNB-INV-${year}${month}${day}-${hours}${minutes}`;
};

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const schema = yup.object().shape({
  invoiceNumber: yup.string().required('發票號碼為必填'),
  date: yup.string().required('日期為必填'),
  
  // Company Information
  companyName: yup.string().required(),
  companyAddress: yup.string().required(),
  companyEmail: yup.string().required(),
  companyPhone: yup.string().required(),
  
  // Client Information
  clientName: yup.string().required('客戶名稱為必填'),
  clientEmail: yup.string().email('無效的電子郵件'),
  clientPhone: yup.string(),
  
  items: yup.array().of(
    yup.object().shape({
      description: yup.string().required('商品描述為必填'),
      quantity: yup.number().required('數量為必填').min(1, '最小數量為1'),
      price: yup.number().required('單價為必填').min(0, '價格不能為負數'),
    })
  ).required().min(1, '至少需要一個商品'),
  
  notes: yup.string(),
});

interface Props {
  onSubmit: (data: InvoiceData) => void;
}

const InvoiceForm: React.FC<Props> = ({ onSubmit }) => {
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<InvoiceData>({
    resolver: yupResolver(schema),
    defaultValues: {
      invoiceNumber: generateInvoiceNumber(),
      date: getTodayDate(),
      items: [{ description: '', quantity: 1, price: 0 }],
      // Set fixed company information
      companyName: 'Na Na Beauty',
      companyAddress: '九龍尖沙咀漆咸道南61 - 65號 首都廣場2樓S129室',
      companyPhone: '98375219',
      companyEmail: 'info@nanabeauty.com',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const [showAdditionalInfo, setShowAdditionalInfo] = React.useState(false);
  const [showNotes, setShowNotes] = React.useState(false);

  // Calculate totals
  React.useEffect(() => {
    const subscription = watch((value: any, { name }: { name?: string }) => {
      if (name?.startsWith('items')) {
        const items = value.items || [];
        const total = items.reduce((sum: number, item: { quantity?: number; price?: number }) => 
          sum + (item.quantity || 0) * (item.price || 0), 0);

        setValue('total', total);
      }
    });

    return () => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    };
  }, [watch, setValue]);

  // Add suggested products with their prices
  const suggestedItems = {
    services: [
      { description: '基本美甲服務', price: 380 },
      { description: '手部護理套餐', price: 480 },
      { description: '足部護理套餐', price: 580 },
      { description: '光療美甲服務', price: 480 },
      { description: '卸甲服務', price: 100 },
    ],
    products: [
      { description: '指甲油 OPI', price: 150 },
      { description: '手部護理霜', price: 120 },
      { description: '足部護理霜', price: 120 },
      { description: '指甲修護精華', price: 180 },
      { description: '去甲油液', price: 80 },
      { description: '指甲銼刀套裝', price: 100 },
    ]
  };

  // Function to handle suggestion click
  const handleSuggestionClick = (index: number, suggestion: { description: string; price: number }) => {
    setValue(`items.${index}.description`, suggestion.description);
    setValue(`items.${index}.price`, suggestion.price);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Invoice Details */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">發票資料</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">發票號碼</label>
            <input
              type="text"
              {...register('invoiceNumber')}
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors bg-gray-50"
              placeholder="例如：NB-240315-1430"
            />
            {errors.invoiceNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.invoiceNumber.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日期</label>
            <input
              type="date"
              {...register('date')}
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors [&::-webkit-calendar-picker-indicator]:order-first [&::-webkit-calendar-picker-indicator]:mr-2"
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Client Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">客戶資料</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">客戶名稱</label>
            <input
              type="text"
              {...register('clientName')}
              className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="例如：陳小明"
            />
            {errors.clientName && (
              <p className="mt-1 text-sm text-red-600">{errors.clientName.message}</p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const currentValue = watch('clientName') || '';
                  const newValue = currentValue.replace(/(小姐|女士|先生)$/, '') + '小姐';
                  setValue('clientName', newValue);
                }}
                className="px-3 py-1 text-sm bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 transition-colors"
              >
                小姐
              </button>
              <button
                type="button"
                onClick={() => {
                  const currentValue = watch('clientName') || '';
                  const newValue = currentValue.replace(/(小姐|女士|先生)$/, '') + '女士';
                  setValue('clientName', newValue);
                }}
                className="px-3 py-1 text-sm bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 transition-colors"
              >
                女士
              </button>
              <button
                type="button"
                onClick={() => {
                  const currentValue = watch('clientName') || '';
                  const newValue = currentValue.replace(/(小姐|女士|先生)$/, '') + '先生';
                  setValue('clientName', newValue);
                }}
                className="px-3 py-1 text-sm bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 transition-colors"
              >
                先生
              </button>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
              className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              {showAdditionalInfo ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              )}
              聯絡資料
            </button>
          </div>

          {showAdditionalInfo && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">電話</label>
                  <input
                    type="tel"
                    {...register('clientPhone')}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="例如：9123 4567（選填）"
                  />
                  {errors.clientPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.clientPhone.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">電子郵件</label>
                  <input
                    type="email"
                    {...register('clientEmail')}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="例如：example@email.com（選填）"
                  />
                  {errors.clientEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.clientEmail.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">商品項目</h2>
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="bg-gray-50 p-4 rounded-md">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:flex-grow">
                  <label className="block text-sm font-medium text-gray-700 mb-1">商品描述</label>
                  <input
                    type="text"
                    {...register(`items.${index}.description`)}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="例如：美甲服務 / 護理套餐"
                  />
                  {errors.items?.[index]?.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.items[index]?.description?.message}</p>
                  )}
                </div>
                <div className="flex gap-2 items-start">
                  <div className="w-full md:w-24">
                    <label className="block text-sm font-medium text-gray-700 mb-1">數量</label>
                    <input
                      type="number"
                      {...register(`items.${index}.quantity`)}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      min="1"
                      placeholder="1"
                    />
                    {errors.items?.[index]?.quantity && (
                      <p className="mt-1 text-sm text-red-600">{errors.items[index]?.quantity?.message}</p>
                    )}
                  </div>
                  <div className="w-full md:w-32">
                    <label className="block text-sm font-medium text-gray-700 mb-1">單價</label>
                    <input
                      type="number"
                      step="0.01"
                      {...register(`items.${index}.price`)}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      min="0"
                      placeholder="例如：380"
                    />
                    {errors.items?.[index]?.price && (
                      <p className="mt-1 text-sm text-red-600">{errors.items[index]?.price?.message}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="mt-6 px-2 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-start gap-2">
                  <span className="text-xs font-medium text-gray-500 whitespace-nowrap w-16 pt-1">服務項目</span>
                  <div className="flex-1 flex flex-wrap gap-2">
                    {suggestedItems.services.map((suggestion, suggestionIndex) => (
                      <button
                        key={`service-${suggestionIndex}`}
                        type="button"
                        onClick={() => handleSuggestionClick(index, suggestion)}
                        className="px-3 py-1 text-sm bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100 transition-colors"
                      >
                        {suggestion.description} (${suggestion.price})
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-start gap-2 mt-2">
                  <span className="text-xs font-medium text-gray-500 whitespace-nowrap w-16 pt-1">產品</span>
                  <div className="flex-1 flex flex-wrap gap-2">
                    {suggestedItems.products.map((suggestion, suggestionIndex) => (
                      <button
                        key={`product-${suggestionIndex}`}
                        type="button"
                        onClick={() => handleSuggestionClick(index, suggestion)}
                        className="px-3 py-1 text-sm bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors"
                      >
                        {suggestion.description} (${suggestion.price})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => append({ description: '', quantity: 1, price: 0 })}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            新增商品
          </button>
        </div>
      </div>

      {/* Additional Fields */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowNotes(!showNotes)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 transform transition-transform ${showNotes ? 'rotate-90' : ''}`} 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-900">備註</h2>
        </div>

        {showNotes && (
          <div className="mt-4 grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
              <textarea
                {...register('notes')}
                rows={3}
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="例如：特別要求或注意事項..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col items-end space-y-3">
          <div className="text-right w-full max-w-xs">
            <div className="flex justify-between py-2">
              <span className="text-lg font-semibold text-gray-900">總計：</span>
              <span className="text-lg font-bold text-indigo-600">${watch('total')?.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
          創建發票
        </button>
      </div>
    </form>
  );
}

export default InvoiceForm; 