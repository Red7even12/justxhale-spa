<template>
    <div class="px-4 sm:px-6 lg:px-8">
        <div class="sm:flex sm:items-center">
            <div class="sm:flex-auto">
                <h1 class="text-xl font-semibold text-gray-900">Non-Working Days</h1>
                <p class="mt-2 text-sm text-gray-700">A list of all the non-working days in the system.</p>
            </div>
            <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <button @click="showAddModal = true" type="button"
                    class="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto">Add
                    Non-Working Day</button>
            </div>
        </div>

        <!-- File Import Section -->
        <div class="mt-8">
            <h2 class="text-lg font-medium text-gray-900">Import Non-Working Days</h2>
            <div class="mt-4 flex items-center">
                <input type="file" @change="handleFileUpload" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                <button @click="importNonWorkingDays" class="ml-4 inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700">Import</button>
            </div>
        </div>

        <!-- Filter Section -->
        <div class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
                <label for="filter-country" class="block text-sm font-medium text-gray-700">Filter by Country</label>
                <select v-model="filterCountry" id="filter-country" name="filter-country" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                    <option value="">All Countries</option>
                    <option v-for="country in countries" :key="country.id" :value="country.id">{{ country.name }}</option>
                </select>
            </div>
            <div>
                <label for="filter-year" class="block text-sm font-medium text-gray-700">Filter by Year</label>
                <input v-model="filterYear" type="number" name="filter-year" id="filter-year" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
            </div>
        </div>

        <div class="mt-8 flex flex-col">
            <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                    <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                        <table class="min-w-full divide-y divide-gray-300">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th scope="col"
                                        class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                        Country</th>
                                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Date</th>
                                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Description</th>
                                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                        <span class="sr-only">Edit</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200 bg-white">
                                <tr v-for="day in nonWorkingDays" :key="day.id">
                                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{{ day.country.name }}</td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ day.date }}</td>
                                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{{ day.description }}</td>
                                    <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                        <a href="#" @click.prevent="openEditModal(day)" class="text-indigo-600 hover:text-indigo-900">Edit</a>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add Modal -->
        <div v-if="showAddModal" class="fixed z-10 inset-0 overflow-y-auto">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <h3 class="text-lg leading-6 font-medium text-gray-900">Add Non-Working Day</h3>
                        <div class="mt-2">
                            <div class="grid grid-cols-1 gap-6">
                                <div>
                                    <label for="country" class="block text-sm font-medium text-gray-700">Country</label>
                                    <select v-model="newDay.countryId" id="country" name="country" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                        <option value="" disabled>Select a country</option>
                                        <option v-for="country in countries" :key="country.id" :value="country.id">{{ country.name }}</option>
                                    </select>
                                </div>
                                <div>
                                    <label for="date" class="block text-sm font-medium text-gray-700">Date</label>
                                    <input v-model="newDay.date" type="date" name="date" id="date" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                                </div>
                                <div>
                                    <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                                    <input v-model="newDay.description" type="text" name="description" id="description" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button @click="addNonWorkingDay" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">Save</button>
                        <button @click="showAddModal = false" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Edit Modal -->
        <div v-if="showEditModal" class="fixed z-10 inset-0 overflow-y-auto">
            <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div class="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>
                <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <h3 class="text-lg leading-6 font-medium text-gray-900">Edit Non-Working Day</h3>
                        <div class="mt-2">
                            <div class="grid grid-cols-1 gap-6">
                                <div>
                                    <label for="edit-country" class="block text-sm font-medium text-gray-700">Country</label>
                                    <select v-model="editingDay.countryId" id="edit-country" name="edit-country" class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                                        <option v-for="country in countries" :key="country.id" :value="country.id">{{ country.name }}</option>
                                    </select>
                                </div>
                                <div>
                                    <label for="edit-date" class="block text-sm font-medium text-gray-700">Date</label>
                                    <input v-model="editingDay.date" type="date" name="edit-date" id="edit-date" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                                </div>
                                <div>
                                    <label for="edit-description" class="block text-sm font-medium text-gray-700">Description</label>
                                    <input v-model="editingDay.description" type="text" name="edit-description" id="edit-description" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button @click="updateNonWorkingDay" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 sm:ml-3 sm:w-auto sm:text-sm">Save</button>
                        <button @click="showEditModal = false" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import nonWorkingDayService from '../../services/nonWorkingDayService';
import referenceDataService from '../../services/referenceDataService';

const showAddModal = ref(false);
const showEditModal = ref(false);
const nonWorkingDays = ref([]);
const countries = ref([]);
const newDay = ref({ countryId: '', date: '', description: '' });
const editingDay = ref(null);
const file = ref(null);
const filterCountry = ref('');
const filterYear = ref(new Date().getFullYear());

const fetchNonWorkingDays = async () => {
    try {
        const params = {
            country_id: filterCountry.value,
            year: filterYear.value,
        };
        const response = await nonWorkingDayService.getNonWorkingDays(params);
        nonWorkingDays.value = response.data;
    } catch (error) {
        console.error('Error fetching non-working days:', error);
    }
};

watch([filterCountry, filterYear], fetchNonWorkingDays);

const fetchCountries = async () => {
    try {
        const response = await referenceDataService.getCountries();
        countries.value = response.data;

        // Set "South Africa" as default if found
        const southAfrica = countries.value.find(country => country.name === 'South Africa');
        if (southAfrica) {
            filterCountry.value = southAfrica.id;
        }
    } catch (error) {
        console.error('Error fetching countries:', error);
    }
};

onMounted(async () => {
    await fetchCountries(); // Fetch countries and set default filterCountry
    fetchNonWorkingDays();  // Then fetch non-working days with the potentially updated filter
});

const handleFileUpload = (event) => {
    file.value = event.target.files[0];
};

const importNonWorkingDays = async () => {
    if (!file.value) {
        alert('Please select a file to import.');
        return;
    }
    try {
        await nonWorkingDayService.importNonWorkingDays(file.value);
        alert('File imported successfully.');
        fetchNonWorkingDays(); // Refresh the list
    } catch (error) {
        console.error('Error importing file:', error);
        alert('File import failed.');
    }
};

const addNonWorkingDay = async () => {
    try {
        await nonWorkingDayService.addNonWorkingDay(newDay.value);
        showAddModal.value = false;
        newDay.value = { countryId: '', date: '', description: '' }; // Reset form
        fetchNonWorkingDays(); // Refresh the list
    } catch (error) {
        console.error('Error adding non-working day:', error);
    }
};

const openEditModal = (day) => {
    editingDay.value = {
        id: day.id,
        countryId: day.countryId,
        date: day.date,
        description: day.description,
    };
    showEditModal.value = true;
};

const updateNonWorkingDay = async () => {
    if (!editingDay.value) return;
    try {
        await nonWorkingDayService.updateNonWorkingDay(editingDay.value.id, editingDay.value);
        showEditModal.value = false;
        fetchNonWorkingDays(); // Refresh the list
    } catch (error) {
        console.error('Error updating non-working day:', error);
    }
};
</script>