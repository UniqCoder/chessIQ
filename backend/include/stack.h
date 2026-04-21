#ifndef CUSTOM_STACK_H
#define CUSTOM_STACK_H

#include <stdexcept>

template <typename T>
class CustomStack {
private:
    T* data;
    int capacity;
    int top_index;

    void resize() {
        capacity = capacity == 0 ? 4 : capacity * 2;
        T* new_data = new T[capacity];
        for (int i = 0; i <= top_index; ++i) {
            new_data[i] = data[i];
        }
        delete[] data;
        data = new_data;
    }

public:
    CustomStack() : capacity(0), top_index(-1), data(nullptr) {}
    
    ~CustomStack() {
        delete[] data;
    }

    void push(const T& element) {
        if (top_index + 1 >= capacity) {
            resize();
        }
        data[++top_index] = element;
    }

    void pop() {
        if (empty()) {
            throw std::out_of_range("Stack<>::pop(): empty stack");
        }
        --top_index;
    }

    T& top() {
        if (empty()) {
            throw std::out_of_range("Stack<>::top(): empty stack");
        }
        return data[top_index];
    }

    const T& top() const {
        if (empty()) {
            throw std::out_of_range("Stack<>::top(): empty stack");
        }
        return data[top_index];
    }

    bool empty() const {
        return top_index == -1;
    }

    int size() const {
        return top_index + 1;
    }

    void clear() {
        top_index = -1;
    }
};

#endif // CUSTOM_STACK_H
