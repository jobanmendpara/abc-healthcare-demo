<script setup lang="ts">
import queries from '~/queries';

definePageMeta({
  layout: 'main',
  middleware: ['verify-admin'],
});

const { id } = useRoute('users-id').params;

const { $api, $toast } = useNuxtApp();
const queryClient = useQueryClient();

const { data: user, status: userQueryStatus } = useQuery({
  ...queries.users.ids([id]),
  select: (data) => {
    return data.get(id) ?? initUser();
  },
});

const {
  data: assignments,
  status: assignmentsQueryStatus,
} = useQuery(queries.assignments.assigned(id));
const {
  data: availableAssignments,
  status: availableAssignmentsQueryStatus,
} = useQuery(queries.assignments.available(id));

const {
  mutate: deleteUser,
  isPending: isDeleteUserMutationPending,
} = useMutation({
  mutationFn: async () => await $api.auth.deleteUser.mutate({ id }),
  onSuccess: () => {
    $toast.success('User updated');
    queryClient.invalidateQueries(queries.users.ids([id]));
    navigateTo({
      name: 'users',
    });
  },
  onError: (error) => {
    $toast.error(error.message);
  },
  onSettled: () => {
    navigateTo({
      name: 'users',
    });
  },
});

const {
  mutate: updateUser,
  isPending: isUpdateUserMutationPending,
} = useMutation({
  mutationFn: async () => await $api.users.updateEmployee.mutate({
    id,
    newIsActiveValue: !user.value?.is_active,
  }),
  onSuccess: () => {
    $toast.success('User updated');
    queryClient.invalidateQueries(queries.users.ids([id]));
  },
  onError: (error) => {
    $toast.error(error.message);
  },
});

const {
  mutate: updateAssignments,
  isPending: isAssignmentsMutationPending,
} = useMutation({
  mutationFn: async (val: { added: string[]; removed: string[] }) => await $api.assignments.update.mutate({ id, ...val }),
  onSuccess: () => {
    $toast.success('User updated');
    queryClient.invalidateQueries(queries.assignments.assigned(id));
    queryClient.invalidateQueries(queries.assignments.available(id));
  },
  onError: (error) => {
    $toast.error(error.message);
  },
});

function copy(value: string) {
  navigator.clipboard.writeText(value);
  $toast.success('Copied to clipboard');
};

function mapAssignmentToAssignmentUser() {
  if (!user.value) {
    return;
  }

  if (!assignments.value) {
    return;
  }

  const role = user.value.role;

  const output = assignments.value.map((assignment) => {
    return assignment[role === 'employee' ? 'client' : 'employee'];
  });

  return output;
}

onMounted(async () => {
  const data = await queryClient.fetchQuery(queries.users.ids([id]));
  const user = data.get(id);

  if (!user) {
    navigateTo({
      name: 'users',
    });
  }
});
</script>

<template>
  <div
    v-if="userQueryStatus === 'success' && user"
    class="space-y-10"
  >
    <section class="w-full flex justify-between items-center">
      <div>
        <h1 class="text-left text-2xl font-semibold">
          {{ user.last_name }}, {{ user.first_name }} {{ user.middle_name }}
        </h1>
        <div class="text-sm">
          <div class="flex-center justify-start gap-1 hover:cursor-pointer">
            <p @click="copy(user.phone_number)">
              {{ formatToPhone(user.phone_number) }}
            </p>
            <Icon
              name="lucide:copy"
              @click="copy(user.geopoint.formatted_address ?? '')"
            />
          </div>
          <div
            v-if="user.email.length > 0"
            class="flex-center justify-start gap-1 hover:cursor-pointer"
          >
            <p @click="copy(user.email)">
              {{ user.email }}
            </p>
            <Icon
              name="lucide:copy"
              @click="copy(user.geopoint.formatted_address ?? '')"
            />
          </div>
          <div class="flex-center justify-start gap-1 hover:cursor-pointer">
            <p @click="copy(user.geopoint.formatted_address ?? '')">
              {{ user.geopoint.formatted_address }}
            </p>
            <Icon
              name="lucide:copy"
              @click="copy(user.geopoint.formatted_address ?? '')"
            />
          </div>
        </div>
      </div>
      <div class="flex-center gap-3">
        <AlertDialog>
          <div class="w-full flex items-center">
            <AlertDialogTrigger v-if="!user.is_active">
              <Button variant="destructive">
                <Icon name="lucide:trash" />
              </Button>
            </AlertDialogTrigger>
          </div>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action is permanent. You cannot undo this action.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction
                variant="destructive"
                :disabled="isDeleteUserMutationPending"
                @click="deleteUser"
              >
                Delete User
              </AlertDialogAction>
              <AlertDialogCancel>
                Cancel
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Button
          :disabled="isUpdateUserMutationPending"
          @click="updateUser"
        >
          {{ user.is_active ? 'Deactivate' : 'Activate' }}
        </Button>
      </div>
    </section>
    <section
      v-if="user?.is_active"
      class="space-y-5"
    >
      <Accordion
        type="single"
        collapsible
      >
        <AccordionItem value="assignments">
          <AccordionTrigger>Assignments</AccordionTrigger>
          <AccordionContent>
            <AssignmentsPickList
              :user="user"
              :initial-assigned="mapAssignmentToAssignmentUser()"
              :initial-assignable="availableAssignments"
              :is-fetching="[assignmentsQueryStatus, availableAssignmentsQueryStatus].includes('pending')"
              :is-mutating="isAssignmentsMutationPending"
              @submit="(val: SubmitAssignmentsEmit) => updateAssignments(val)"
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="timecards">
          <AccordionTrigger>Timecards</AccordionTrigger>
          <AccordionContent />
        </AccordionItem>
      </accordion>
    </section>
  </div>
  <p v-else>
    ...Loading
  </p>
</template>
