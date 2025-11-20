'use client';

import React, { useEffect, useState } from 'react';

interface PriceDetailsProps {
  designId: string;
  mlDir: string;
}

export default function PriceDetails({ designId, mlDir }: PriceDetailsProps) {
  const [priceHtml, setPriceHtml] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState<string | null>(null);

  useEffect(() => {
    async function loadPriceHtml() {
      try {
        setLoading(true);
        const response = await fetch(`/ml/${mlDir}/saved-designs/html/${designId}.html`);
        
        if (response.ok) {
          const html = await response.text();
          setPriceHtml(html);
          
          // Extract total price from HTML
          const totalMatch = html.match(/class="total-title">Total<\/td><td>\$?([\d,]+\.?\d*)</);
          if (totalMatch && totalMatch[1]) {
            setTotalPrice(totalMatch[1]);
          }
        }
      } catch (error) {
        console.error('Error loading price HTML:', error);
      } finally {
        setLoading(false);
      }
    }

    if (designId && mlDir) {
      loadPriceHtml();
    }
  }, [designId, mlDir]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
          <span className="ml-3 text-slate-600">Loading price details...</span>
        </div>
      </div>
    );
  }

  if (!priceHtml) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-light text-white mb-2">
              Price Breakdown
            </h2>
            <p className="text-slate-300 text-sm font-light">
              Detailed itemization for this design
            </p>
          </div>
          {totalPrice && (
            <div className="text-right">
              <p className="text-sm text-slate-400 uppercase tracking-wide mb-1">Total</p>
              <p className="text-4xl font-light text-white">
                ${totalPrice}
              </p>
              <p className="text-xs text-slate-400 mt-1">USD (shipping inclusive)</p>
            </div>
          )}
        </div>
      </div>

      {/* Price Table */}
      <div className="p-8">
        <div 
          className="price-details-wrapper"
          dangerouslySetInnerHTML={{ __html: priceHtml }}
        />
      </div>

      {/* Call to Action */}
      <div className="bg-slate-50 px-8 py-6 border-t border-slate-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <p className="text-slate-900 font-medium mb-1">Ready to customize this design?</p>
            <p className="text-sm text-slate-600 font-light">
              Edit inscriptions, add photos, change motifs and get instant pricing
            </p>
          </div>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-light uppercase tracking-wider shadow-md hover:shadow-lg whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Customize Design
          </a>
        </div>
      </div>

      <style jsx global>{`
        .price-details-wrapper .mdc-data-table {
          width: 100%;
          border: none;
        }

        .price-details-wrapper table {
          width: 100%;
          border-collapse: collapse;
        }

        .price-details-wrapper thead {
          background-color: #f8fafc;
          border-bottom: 2px solid #e2e8f0;
        }

        .price-details-wrapper thead th {
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          font-size: 0.875rem;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .price-details-wrapper tbody tr {
          border-bottom: 1px solid #f1f5f9;
          transition: background-color 0.2s;
        }

        .price-details-wrapper tbody tr:hover:not(.total-flex) {
          background-color: #f8fafc;
        }

        .price-details-wrapper tbody td {
          padding: 16px;
          font-size: 0.875rem;
          color: #334155;
        }

        .price-details-wrapper .table-header-for-mobile {
          display: none;
        }

        .price-details-wrapper .mobile-only {
          display: none;
        }

        .price-details-wrapper tbody td strong {
          color: #0f172a;
          font-weight: 600;
        }

        .price-details-wrapper tbody td p {
          margin: 0;
          line-height: 1.6;
        }

        .price-details-wrapper .total-flex {
          background-color: #f8fafc;
          border-top: 2px solid #e2e8f0;
          font-weight: 600;
        }

        .price-details-wrapper .total-flex .total-title {
          text-align: right;
          font-size: 1rem;
          color: #0f172a;
          padding-right: 16px;
        }

        .price-details-wrapper .total-flex td:last-child {
          font-size: 1.25rem;
          color: #0f172a;
        }

        .price-details-wrapper .empty-cell {
          padding: 0;
          border: none;
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .price-details-wrapper table,
          .price-details-wrapper thead,
          .price-details-wrapper tbody,
          .price-details-wrapper th,
          .price-details-wrapper td,
          .price-details-wrapper tr {
            display: block;
          }

          .price-details-wrapper thead {
            display: none;
          }

          .price-details-wrapper tbody tr {
            margin-bottom: 16px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
          }

          .price-details-wrapper tbody td {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 8px 0;
            border: none;
          }

          .price-details-wrapper .table-header-for-mobile {
            display: inline-block;
            font-weight: bold;
            min-width: 80px;
            max-width: 80px;
            margin-right: 10px;
            color: #64748b;
          }

          .price-details-wrapper .mobile-only {
            display: block;
          }

          .price-details-wrapper .total-flex {
            background-color: #f1f5f9;
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}
