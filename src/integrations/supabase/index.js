import { createClient } from '@supabase/supabase-js';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';

const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

import React from "react";
export const queryClient = new QueryClient();
export function SupabaseProvider({ children }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
}

const fromSupabase = async (query) => {
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
};

/* supabase integration types

### user_table

| name       | type                    | format | required |
|------------|-------------------------|--------|----------|
| id         | bigint                  | number | true     |
| created_at | timestamp with time zone| string | true     |
| last_upd   | timestamp with time zone| string | true     |
| user_id    | text                    | string | true     |
| password   | text                    | string | true     |
| user_type  | text                    | string | true     |
| user_org   | text                    | string | true     |
| created_by | text                    | string | false    |
| last_upd_by| text                    | string | false    |

### user_org

| name       | type                    | format | required |
|------------|-------------------------|--------|----------|
| id         | bigint                  | number | true     |
| created_at | timestamp with time zone| string | true     |
| last_upd   | timestamp with time zone| string | true     |
| created_by | text                    | string | true     |
| last_upd_by| text                    | string | true     |
| org_name   | text                    | string | true     |

### dsr_tracker

| name       | type                    | format | required |
|------------|-------------------------|--------|----------|
| id         | bigint                  | number | true     |
| created_dt | timestamp with time zone| string | true     |
| po_number  | text                    | string | true     |
| last_upd_dt| timestamp with time zone| string | true     |
| last_upd_by| text                    | string | true     |
| created_by | text                    | string | true     |
| comments   | json                    | object | true     |
| user_org   | text                    | string | true     |

### enquiry

| name                | type             | format | required |
|---------------------|------------------|--------|----------|
| id                  | integer          | number | true     |
| sno                 | integer          | number | true     |
| created_by          | character varying| string | true     |
| created_date        | date             | string | true     |
| enquiry_id          | character varying| string | false    |
| channel             | character varying| string | true     |
| enquiry_mode        | character varying| string | true     |
| enquiry_type        | character varying| string | true     |
| enquiry_subtype     | character varying| string | true     |
| client              | character varying| string | true     |
| inco_terms          | character varying| string | true     |
| origin_country      | character varying| string | true     |
| origin_port         | character varying| string | true     |
| destination_country | character varying| string | true     |
| destination_port    | character varying| string | true     |
| length              | integer          | number | true     |
| breadth             | integer          | number | true     |
| height              | integer          | number | true     |
| unit_of_measurement | character varying| string | true     |
| package_type        | character varying| string | true     |
| no_of_pkgs          | integer          | number | true     |
| net_weight          | integer          | number | false    |
| total_net           | integer          | number | false    |
| gross_weight        | integer          | number | true     |
| total_gross         | integer          | number | false    |
| equipment           | character varying| string | true     |
| no_of_units         | integer          | number | true     |
| commodity           | character varying| string | true     |
| cargo_readiness     | date             | string | false    |
| cut_off_eta         | date             | string | false    |
| indication_in_usd   | character varying| string | false    |
| remarks             | character varying| string | false    |
| is_assigned         | boolean          | boolean| false    |
| is_deleted          | boolean          | boolean| false    |
| updated_by          | character varying| string | true     |
| updated_date        | date             | string | true     |

*/

// Hooks for user_table
export const useUserTable = () => useQuery({
    queryKey: ['user_table'],
    queryFn: () => fromSupabase(supabase.from('user_table').select('*')),
});

export const useUserTableById = (id) => useQuery({
    queryKey: ['user_table', id],
    queryFn: () => fromSupabase(supabase.from('user_table').select('*').eq('id', id).single()),
});

export const useAddUserTable = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newUser) => fromSupabase(supabase.from('user_table').insert([newUser])),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user_table'] });
        },
    });
};

export const useUpdateUserTable = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('user_table').update(updateData).eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user_table'] });
        },
    });
};

export const useDeleteUserTable = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => fromSupabase(supabase.from('user_table').delete().eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user_table'] });
        },
    });
};

// Hooks for user_org
export const useUserOrg = () => useQuery({
    queryKey: ['user_org'],
    queryFn: () => fromSupabase(supabase.from('user_org').select('*')),
});

export const useUserOrgById = (id) => useQuery({
    queryKey: ['user_org', id],
    queryFn: () => fromSupabase(supabase.from('user_org').select('*').eq('id', id).single()),
});

export const useAddUserOrg = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newOrg) => fromSupabase(supabase.from('user_org').insert([newOrg])),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user_org'] });
        },
    });
};

export const useUpdateUserOrg = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('user_org').update(updateData).eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user_org'] });
        },
    });
};

export const useDeleteUserOrg = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => fromSupabase(supabase.from('user_org').delete().eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['user_org'] });
        },
    });
};

// Hooks for dsr_tracker
export const useDsrTracker = () => useQuery({
    queryKey: ['dsr_tracker'],
    queryFn: () => fromSupabase(supabase.from('dsr_tracker').select('*')),
});

export const useDsrTrackerById = (id) => useQuery({
    queryKey: ['dsr_tracker', id],
    queryFn: () => fromSupabase(supabase.from('dsr_tracker').select('*').eq('id', id).single()),
});

export const useAddDsrTracker = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newDsr) => fromSupabase(supabase.from('dsr_tracker').insert([newDsr])),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dsr_tracker'] });
        },
    });
};

export const useUpdateDsrTracker = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('dsr_tracker').update(updateData).eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dsr_tracker'] });
        },
    });
};

export const useDeleteDsrTracker = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => fromSupabase(supabase.from('dsr_tracker').delete().eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['dsr_tracker'] });
        },
    });
};

// Hooks for enquiry
export const useEnquiry = () => useQuery({
    queryKey: ['enquiry'],
    queryFn: () => fromSupabase(supabase.from('enquiry').select('*')),
});

export const useEnquiryById = (id) => useQuery({
    queryKey: ['enquiry', id],
    queryFn: () => fromSupabase(supabase.from('enquiry').select('*').eq('id', id).single()),
});

export const useAddEnquiry = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newEnquiry) => fromSupabase(supabase.from('enquiry').insert([newEnquiry])),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enquiry'] });
        },
    });
};

export const useUpdateEnquiry = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('enquiry').update(updateData).eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enquiry'] });
        },
    });
};

export const useDeleteEnquiry = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => fromSupabase(supabase.from('enquiry').delete().eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['enquiry'] });
        },
    });
};