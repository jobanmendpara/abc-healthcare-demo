<script setup lang="ts">
import queries from '~/queries';

const isOpen = ref(false);

const { $api, $toast } = useNuxtApp();
const queryClient = useQueryClient();

const { mutate: updateUser, isPending } = useMutation({
  mutationFn: async (user: Partial<User>) => {
    const newClient: User = {
      id: crypto.randomUUID(),
      first_name: user.first_name ?? '',
      middle_name: user.middle_name ?? '',
      last_name: user.last_name ?? '',
      email: user.email ?? '',
      geopoint: user.geopoint ?? initGeopoint(),
      phone_number: user.phone_number ?? '',
      role: 'client',
      is_active: true,
    };

    await $api.users.create.mutate({ user: newClient });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: queries.users.list._def,
    });
    $toast.success('Client created');
  },
  onError: (error) => {
    $toast.error(error.message);
  },
});
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogTrigger>
      <Button>
        Create
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogTitle>
        Create Client
      </DialogTitle>
      <DialogDescription>
        Please enter the client's information
      </DialogDescription>
      <ClientUserForm
        :is-pending="isPending"
        @submit="(val: Partial<User>) => updateUser(val)"
      />
    </DialogContent>
  </Dialog>
</template>
